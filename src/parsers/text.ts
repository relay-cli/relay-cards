import {createEventBase, type TextEvent} from '../events/index.js';
import type {LineParser} from './types.js';

export const parseTextLine: LineParser = (line, context) =>
  ({
    ...createEventBase({stream: context.stream, raw: line, timestamp: context.timestamp}),
    kind: 'text',
    message: line,
  }) satisfies TextEvent;
