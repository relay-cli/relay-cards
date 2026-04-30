import type {EventBase, EventStream} from './types.js';

let nextId = 0;

export interface EventBaseInput {
  stream: EventStream;
  raw: string;
  timestamp?: Date | undefined;
}

export const createEventBase = ({stream, raw, timestamp}: EventBaseInput): EventBase => ({
  id: `relay-${Date.now().toString(36)}-${(nextId++).toString(36)}`,
  timestamp: timestamp ?? new Date(),
  stream,
  raw,
  repeat: 1,
});

export const resetEventIdsForTests = (): void => {
  nextId = 0;
};
