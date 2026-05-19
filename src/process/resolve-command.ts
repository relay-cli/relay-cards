import {extname} from 'node:path';
import {spawnSync} from 'node:child_process';

export interface PreparedCommand {
  executable: string;
  arguments: string[];
  windowsVerbatimArguments?: boolean;
}

const windowsScriptExtensions = new Set(['.bat', '.cmd']);

const quoteForCommandPrompt = (value: string): string => {
  const escaped = value.replace(/%/g, '%%').replace(/["^&|<>()]/g, '^$&');
  return `"${escaped}"`;
};

const resolveOnWindows = (executable: string): string => {
  if (extname(executable) !== '') {
    return executable;
  }

  const result = spawnSync('where.exe', [executable], {
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    return executable;
  }

  const candidates = result.stdout
    .split(/\r?\n/)
    .map((candidate) => candidate.trim())
    .filter(Boolean);
  return (
    candidates.find((candidate) => ['.exe', '.com'].includes(extname(candidate).toLowerCase())) ??
    candidates.find((candidate) => windowsScriptExtensions.has(extname(candidate).toLowerCase())) ??
    executable
  );
};

export const prepareCommand = (command: readonly string[]): PreparedCommand => {
  const [requestedExecutable, ...arguments_] = command;
  if (requestedExecutable === undefined) {
    throw new Error('A command is required.');
  }

  if (process.platform !== 'win32') {
    return {executable: requestedExecutable, arguments: arguments_};
  }

  const resolvedExecutable = resolveOnWindows(requestedExecutable);
  if (!windowsScriptExtensions.has(extname(resolvedExecutable).toLowerCase())) {
    return {executable: resolvedExecutable, arguments: arguments_};
  }

  const commandLine = `call ${[resolvedExecutable, ...arguments_]
    .map(quoteForCommandPrompt)
    .join(' ')}`;
  return {
    executable: process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe',
    arguments: ['/d', '/c', commandLine],
    windowsVerbatimArguments: true,
  };
};
