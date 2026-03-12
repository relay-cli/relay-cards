import {Text} from 'ink';
import type {JsonEvent} from '../../events/index.js';
import {CardFrame} from '../CardFrame.js';
import {formatTimestamp} from '../format.js';
import {theme} from '../theme.js';

export interface JsonCardProps {
  event: JsonEvent;
  expanded?: boolean;
  selected?: boolean;
}

const compactJson = (data: unknown): string => {
  const serialized = JSON.stringify(data);
  if (serialized === undefined) return String(data);
  return serialized.length > 240 ? `${serialized.slice(0, 237)}…` : serialized;
};

export const JsonCard = ({event, expanded = false, selected = false}: JsonCardProps) => (
  <CardFrame
    title={event.label ?? 'Structured data'}
    accent={theme.blue}
    meta={formatTimestamp(event.timestamp)}
    repeat={event.repeat}
    selected={selected}
  >
    <Text color={expanded ? theme.text : theme.muted}>
      {expanded ? JSON.stringify(event.data, null, 2) : compactJson(event.data)}
    </Text>
  </CardFrame>
);
