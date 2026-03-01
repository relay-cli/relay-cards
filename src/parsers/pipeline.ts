import type {EventStream, RelayEvent} from '../events/index.js';
import {normalizeLine} from '../input/index.js';
import {StackTraceCollector} from './error.js';
import {parseHttpLine} from './http.js';
import {parseJsonLine} from './json.js';
import {parseTextLine} from './text.js';
import type {LineParser, ParseContext} from './types.js';
import {parseWarningLine} from './warning.js';

export interface ParserPipelineOptions {
  parsers?: LineParser[];
}

export class ParserPipeline {
  readonly #stackTraceCollector = new StackTraceCollector();
  readonly #parsers: LineParser[];

  constructor({parsers}: ParserPipelineOptions = {}) {
    this.#parsers = parsers ?? [parseHttpLine, parseJsonLine, parseWarningLine];
  }

  push(line: string, stream: EventStream, timestamp = new Date()): RelayEvent[] {
    const normalized = normalizeLine(line);
    const context: ParseContext = {stream, timestamp};
    const stackResult = this.#stackTraceCollector.push(normalized, context);

    if (stackResult.consumed) {
      return stackResult.events;
    }

    for (const parser of this.#parsers) {
      const event = parser(normalized, context);
      if (event !== undefined) {
        return [...stackResult.events, event];
      }
    }

    const textEvent = parseTextLine(normalized, context);
    return textEvent === undefined ? stackResult.events : [...stackResult.events, textEvent];
  }

  flush(): RelayEvent[] {
    return this.#stackTraceCollector.flush();
  }
}
