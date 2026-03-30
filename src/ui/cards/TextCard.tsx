import {Text} from 'ink';
import type {TextEvent} from '../../events/index.js';
import {CardFrame} from '../CardFrame.js';
import {formatTimestamp} from '../format.js';
import {theme} from '../theme.js';

export interface TextCardProps {
  event: TextEvent;
  selected?: boolean;
}

export const TextCard = ({event, selected = false}: TextCardProps) => (
  <CardFrame
    title={event.stream === 'stderr' ? 'Standard error' : 'Message'}
    accent={event.stream === 'stderr' ? theme.orange : theme.muted}
    meta={formatTimestamp(event.timestamp)}
    repeat={event.repeat}
    selected={selected}
  >
    <Text color={theme.text}>{event.message === '' ? ' ' : event.message}</Text>
  </CardFrame>
);
