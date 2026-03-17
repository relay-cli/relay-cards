import {Text} from 'ink';
import type {WarningEvent} from '../../events/index.js';
import {CardFrame} from '../CardFrame.js';
import {formatTimestamp} from '../format.js';
import {theme} from '../theme.js';

export interface WarningCardProps {
  event: WarningEvent;
  selected?: boolean;
}

export const WarningCard = ({event, selected = false}: WarningCardProps) => (
  <CardFrame
    title="Warning"
    accent={theme.yellow}
    meta={formatTimestamp(event.timestamp)}
    repeat={event.repeat}
    selected={selected}
  >
    <Text color={theme.text}>{event.message}</Text>
  </CardFrame>
);
