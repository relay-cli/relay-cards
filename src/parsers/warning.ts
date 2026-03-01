import {createEventBase, type WarningEvent} from '../events/index.js';
import type {LineParser} from './types.js';

const warningPattern = /^(?:\[[^\]]+\]\s*)?(?:warn(?:ing)?)(?:\s*[:|-]\s*|\s+)(?<message>.*)$/i;

export const parseWarningLine: LineParser = (line, context) => {
  const match = warningPattern.exec(line);
  if (match === null) {
    return undefined;
  }

  return {
    ...createEventBase({stream: context.stream, raw: line, timestamp: context.timestamp}),
    kind: 'warning',
    message: match.groups?.message?.trim() || 'Warning',
  } satisfies WarningEvent;
};
