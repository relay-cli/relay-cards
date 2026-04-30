import {Box, Text} from 'ink';
import type {HttpEvent} from '../../events/index.js';
import {CardFrame} from '../CardFrame.js';
import {formatBytes, formatTimestamp} from '../format.js';
import {theme} from '../theme.js';

export interface HttpCardProps {
  event: HttpEvent;
  expanded?: boolean;
  selected?: boolean;
}

const statusColor = (status?: number): string => {
  if (status === undefined) return theme.muted;
  if (status >= 500) return theme.red;
  if (status >= 400) return theme.yellow;
  if (status >= 300) return theme.orange;
  return theme.green;
};

export const HttpCard = ({event, expanded = false, selected = false}: HttpCardProps) => (
  <CardFrame
    title="HTTP request"
    accent={theme.blue}
    meta={formatTimestamp(event.timestamp)}
    repeat={event.repeat}
    selected={selected}
  >
    <Box gap={1}>
      <Text bold color={theme.blue}>
        {event.method}
      </Text>
      <Text color={theme.text} wrap="truncate-middle">
        {event.path}
      </Text>
      {event.status !== undefined && (
        <Text bold color={statusColor(event.status)}>
          {event.status}
        </Text>
      )}
    </Box>
    <Box gap={2} marginTop={1}>
      {event.durationMs !== undefined && (
        <Text color={theme.muted}>{event.durationMs.toFixed(1)} ms</Text>
      )}
      {event.bytes !== undefined && <Text color={theme.muted}>{formatBytes(event.bytes)}</Text>}
      {event.remoteAddress !== undefined && <Text color={theme.muted}>{event.remoteAddress}</Text>}
    </Box>
    {expanded && (
      <Box marginTop={1}>
        <Text color={theme.muted}>{event.raw}</Text>
      </Box>
    )}
  </CardFrame>
);
