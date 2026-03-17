import {Box, Text} from 'ink';
import type {ErrorEvent} from '../../events/index.js';
import {CardFrame} from '../CardFrame.js';
import {formatTimestamp} from '../format.js';
import {theme} from '../theme.js';

export interface ErrorCardProps {
  event: ErrorEvent;
  expanded?: boolean;
  selected?: boolean;
}

export const ErrorCard = ({event, expanded = false, selected = false}: ErrorCardProps) => (
  <CardFrame
    title="Error"
    accent={theme.red}
    meta={formatTimestamp(event.timestamp)}
    repeat={event.repeat}
    selected={selected}
  >
    <Text bold color={theme.text}>
      {event.message}
    </Text>
    {expanded && event.stack !== undefined && (
      <Box marginTop={1} flexDirection="column">
        <Text color={theme.muted}>{event.stack}</Text>
      </Box>
    )}
  </CardFrame>
);
