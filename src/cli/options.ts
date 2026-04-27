import {relayCardsVersion} from '../version.js';

export interface CliOptions {
  command: string[];
  history: number;
  coalesceWithinMs: number;
  plain: boolean;
  help: boolean;
  version: boolean;
}

const readPositiveInteger = (value: string | undefined, option: string): number => {
  const parsed = Number(value);
  if (value === undefined || !Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${option} requires a positive integer.`);
  }
  return parsed;
};

export const parseCliOptions = (arguments_: readonly string[]): CliOptions => {
  const options: CliOptions = {
    command: [],
    history: 500,
    coalesceWithinMs: 1000,
    plain: false,
    help: false,
    version: false,
  };

  let index = 0;
  while (index < arguments_.length) {
    const argument = arguments_[index];
    if (argument === '--') {
      options.command = arguments_.slice(index + 1);
      return options;
    }
    if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--version' || argument === '-v') options.version = true;
    else if (argument === '--plain') options.plain = true;
    else if (argument === '--no-coalesce') options.coalesceWithinMs = 0;
    else if (argument === '--history') {
      options.history = readPositiveInteger(arguments_[++index], '--history');
    } else if (argument?.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      options.command = arguments_.slice(index);
      return options;
    }
    index += 1;
  }

  return options;
};

export const helpText = `Relay Cards ${relayCardsVersion}

Run a command and present its output as readable terminal cards.

Usage:
  relay-cards [options] -- <command> [arguments]
  <command> | relay-cards [options]

Options:
  --history <count>  Number of events retained in memory (default: 500)
  --no-coalesce      Keep repeated consecutive events separate
  --plain            Disable the interactive interface
  -h, --help         Show this help
  -v, --version      Show the version
`;
