import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {createEventBase, type ProcessEvent, type RelayEvent} from '../events/index.js';
import {LineBuffer} from '../input/index.js';
import {ParserPipeline} from '../parsers/index.js';
import {prepareCommand} from './resolve-command.js';

export interface RunCommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  onEvent: (event: RelayEvent) => void;
}

export interface CommandResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
}

export interface RunningCommand {
  child: ChildProcessWithoutNullStreams;
  completion: Promise<CommandResult>;
  displayCommand: string;
  stop: (signal?: NodeJS.Signals) => boolean;
}

const quoteArgument = (value: string): string => (/\s/.test(value) ? JSON.stringify(value) : value);

export const formatCommand = (command: readonly string[]): string =>
  command.map(quoteArgument).join(' ');

const processEvent = (
  state: ProcessEvent['state'],
  command: string,
  details: Pick<ProcessEvent, 'pid' | 'exitCode' | 'signal'> = {},
): ProcessEvent => ({
  ...createEventBase({stream: 'system', raw: `${state}: ${command}`}),
  kind: 'process',
  state,
  command,
  ...details,
});

export const runCommand = (
  command: readonly string[],
  options: RunCommandOptions,
): RunningCommand => {
  const displayCommand = formatCommand(command);
  const prepared = prepareCommand(command);
  options.onEvent(processEvent('starting', displayCommand));

  const child = spawn(prepared.executable, prepared.arguments, {
    cwd: options.cwd,
    env: options.env,
    shell: false,
    windowsVerbatimArguments: prepared.windowsVerbatimArguments ?? false,
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const stdoutBuffer = new LineBuffer();
  const stderrBuffer = new LineBuffer();
  const stdoutParser = new ParserPipeline();
  const stderrParser = new ParserPipeline();

  const emitLines = (
    lines: readonly string[],
    stream: 'stdout' | 'stderr',
    parser: ParserPipeline,
  ): void => {
    for (const line of lines) {
      const otherParser = stream === 'stdout' ? stderrParser : stdoutParser;
      for (const event of otherParser.flush()) {
        options.onEvent(event);
      }
      for (const event of parser.push(line, stream)) {
        options.onEvent(event);
      }
    }
  };

  child.stdout.on('data', (chunk: Buffer) => {
    emitLines(stdoutBuffer.push(chunk), 'stdout', stdoutParser);
  });
  child.stderr.on('data', (chunk: Buffer) => {
    emitLines(stderrBuffer.push(chunk), 'stderr', stderrParser);
  });

  child.once('spawn', () => {
    options.onEvent(
      processEvent('running', displayCommand, child.pid === undefined ? {} : {pid: child.pid}),
    );
  });

  const completion = new Promise<CommandResult>((resolve) => {
    child.once('error', (error) => {
      options.onEvent({
        ...createEventBase({stream: 'system', raw: error.message}),
        kind: 'error',
        message: `Unable to start ${displayCommand}: ${error.message}`,
      });
    });

    child.once('close', (exitCode, signal) => {
      emitLines(stdoutBuffer.flush(), 'stdout', stdoutParser);
      emitLines(stderrBuffer.flush(), 'stderr', stderrParser);
      for (const event of [...stdoutParser.flush(), ...stderrParser.flush()]) {
        options.onEvent(event);
      }
      options.onEvent(processEvent('exited', displayCommand, {exitCode, signal}));
      resolve({exitCode, signal});
    });
  });

  const stop = (signal: NodeJS.Signals = 'SIGTERM'): boolean => {
    if (child.exitCode !== null || child.signalCode !== null) {
      return false;
    }
    options.onEvent(processEvent('stopping', displayCommand, {signal}));
    return child.kill(signal);
  };

  return {child, completion, displayCommand, stop};
};
