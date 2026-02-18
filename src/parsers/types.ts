import type {EventStream, RelayEvent} from '../events/index.js';

export interface ParseContext {
  stream: EventStream;
  timestamp?: Date;
}

export type LineParser = (line: string, context: ParseContext) => RelayEvent | undefined;
