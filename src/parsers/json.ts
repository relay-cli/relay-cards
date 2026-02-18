import {createEventBase, type JsonEvent} from '../events/index.js';
import type {LineParser} from './types.js';

const deriveLabel = (data: unknown): string | undefined => {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return undefined;
  }

  for (const key of ['event', 'type', 'name', 'level']) {
    const value = Reflect.get(data, key);
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

export const parseJsonLine: LineParser = (line, context) => {
  const candidate = line.trim();
  if (!candidate.startsWith('{') && !candidate.startsWith('[')) {
    return undefined;
  }

  try {
    const data: unknown = JSON.parse(candidate);
    const label = deriveLabel(data);
    return {
      ...createEventBase({stream: context.stream, raw: line, timestamp: context.timestamp}),
      kind: 'json',
      data,
      ...(label === undefined ? {} : {label}),
    } satisfies JsonEvent;
  } catch {
    return undefined;
  }
};
