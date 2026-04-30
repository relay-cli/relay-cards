import {createEventBase, type ErrorEvent} from '../events/index.js';
import type {ParseContext} from './types.js';

const errorHeaderPattern =
  /^(?:\[[^\]]+\]\s*)?(?:error|fatal|uncaught(?:exception)?|unhandled(?:rejection)?)(?:\s*[:|-]\s*|\s+)(?<message>.*)$/i;
const namedErrorPattern = /^(?<name>[A-Z][A-Za-z]+Error):\s*(?<message>.*)$/;
const stackContinuationPattern = /^(?:\s+at\s+|\s*\.\.\.\s+\d+\s+more|Caused by:|\s*File\s+")/;

export const isStackContinuation = (line: string): boolean => stackContinuationPattern.test(line);

export const parseErrorHeader = (line: string, context: ParseContext): ErrorEvent | undefined => {
  const errorMatch = errorHeaderPattern.exec(line);
  if (errorMatch !== null) {
    return {
      ...createEventBase({stream: context.stream, raw: line, timestamp: context.timestamp}),
      kind: 'error',
      message: errorMatch.groups?.message?.trim() || 'Error',
    };
  }

  const namedMatch = namedErrorPattern.exec(line.trim());
  if (namedMatch === null) {
    return undefined;
  }

  const name = namedMatch.groups?.name ?? 'Error';
  const message = namedMatch.groups?.message?.trim();
  return {
    ...createEventBase({stream: context.stream, raw: line, timestamp: context.timestamp}),
    kind: 'error',
    message: message === undefined || message === '' ? name : `${name}: ${message}`,
  };
};

export class StackTraceCollector {
  #pending: ErrorEvent | undefined;

  push(line: string, context: ParseContext): {events: ErrorEvent[]; consumed: boolean} {
    if (this.#pending !== undefined && isStackContinuation(line)) {
      const stack = this.#pending.stack;
      this.#pending = {
        ...this.#pending,
        raw: `${this.#pending.raw}\n${line}`,
        stack: stack === undefined ? line : `${stack}\n${line}`,
      };
      return {events: [], consumed: true};
    }

    const events = this.flush();
    const nextError = parseErrorHeader(line, context);
    if (nextError === undefined) {
      return {events, consumed: false};
    }

    this.#pending = nextError;
    return {events, consumed: true};
  }

  flush(): ErrorEvent[] {
    if (this.#pending === undefined) {
      return [];
    }

    const event = this.#pending;
    this.#pending = undefined;
    return [event];
  }
}
