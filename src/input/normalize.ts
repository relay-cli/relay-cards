import stripAnsi from 'strip-ansi';

const unsupportedControlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export const normalizeLine = (line: string): string =>
  stripAnsi(line).replace(unsupportedControlCharacters, '').replace(/\r$/, '').trimEnd();
