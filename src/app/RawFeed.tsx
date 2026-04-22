import {Box, Text} from 'ink';
import type {RelayEvent} from '../events/index.js';
import {formatTimestamp, theme} from '../ui/index.js';

export interface RawFeedProps {
  events: readonly RelayEvent[];
  visibleCount?: number;
}

export const RawFeed = ({events, visibleCount = 16}: RawFeedProps) => {
  const visible = events.slice(-visibleCount);
  if (visible.length === 0) {
    return (
      <Box paddingY={2} justifyContent="center">
        <Text color={theme.muted}>Waiting for output…</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {visible.map((event) => (
        <Box key={event.id} gap={1}>
          <Text color={theme.muted}>{formatTimestamp(event.timestamp)}</Text>
          <Text color={event.stream === 'stderr' ? theme.orange : theme.blue}>
            [{event.stream}]
          </Text>
          <Text color={theme.text}>{event.raw === '' ? ' ' : event.raw}</Text>
          {event.repeat > 1 && <Text color={theme.muted}>×{event.repeat}</Text>}
        </Box>
      ))}
    </Box>
  );
};
