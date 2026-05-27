#!/usr/bin/env node

import {render, type Instance} from 'ink';
import {RelayCardsApp} from './app/index.js';
import {readEventStream} from './input/index.js';
import {writePlainEvent} from './output/index.js';
import {forwardProcessSignals, formatCommand, runCommand} from './process/index.js';
import {EventStore} from './store/index.js';
import {helpText, parseCliOptions} from './cli/options.js';
import {relayCardsVersion} from './version.js';

const run = async (): Promise<void> => {
  let options;
  try {
    options = parseCliOptions(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n\n${helpText}`,
    );
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    process.stdout.write(helpText);
    return;
  }
  if (options.version) {
    process.stdout.write(`${relayCardsVersion}\n`);
    return;
  }

  const interactive =
    !options.plain && process.stdout.isTTY === true && process.stdin.isTTY === true;
  const store = new EventStore({
    limit: options.history,
    coalesceWithinMs: options.coalesceWithinMs,
  });
  const onEvent = interactive ? store.append.bind(store) : writePlainEvent;

  if (options.command.length === 0) {
    if (process.stdin.isTTY === true) {
      process.stderr.write(`A command or piped input is required.\n\n${helpText}`);
      process.exitCode = 2;
      return;
    }
    await readEventStream(process.stdin, {onEvent});
    return;
  }

  const commandLabel = formatCommand(options.command);
  let app: Instance | undefined;
  let requestQuit: (() => void) | undefined;
  const quitRequested = new Promise<void>((resolve) => {
    requestQuit = resolve;
  });
  const running = runCommand(options.command, {onEvent});
  const removeSignalForwarding = forwardProcessSignals(running.child);

  if (interactive) {
    app = render(
      <RelayCardsApp
        store={store}
        commandLabel={commandLabel}
        onQuit={() => {
          running.stop('SIGTERM');
          app?.unmount();
          requestQuit?.();
        }}
      />,
      {exitOnCtrlC: false},
    );
  }

  const result = await Promise.race([
    running.completion,
    quitRequested.then(
      () => new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1500)),
    ),
  ]);
  removeSignalForwarding();
  app?.unmount();
  if (result === undefined) {
    running.detach();
    process.exitCode = 130;
    return;
  }
  process.exitCode = result.exitCode ?? (result.signal === null ? 1 : 128);
};

await run();
