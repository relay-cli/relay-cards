import {Box, Text} from 'ink';
import type {RelayEvent} from '../events/index.js';
import {EventCard, theme} from '../ui/index.js';

export interface CardFeedProps {
  events: readonly RelayEvent[];
  selectedIndex: number;
  expandedIds?: ReadonlySet<string>;
  visibleCount?: number;
}

const visibleRange = (length: number, selectedIndex: number, count: number): [number, number] => {
  if (length <= count) return [0, length];
  const half = Math.floor(count / 2);
  const start = Math.max(0, Math.min(selectedIndex - half, length - count));
  return [start, Math.min(length, start + count)];
};

export const CardFeed = ({
  events,
  selectedIndex,
  expandedIds = new Set(),
  visibleCount = 5,
}: CardFeedProps) => {
  if (events.length === 0) {
    return (
      <Box paddingY={2} justifyContent="center">
        <Text color={theme.muted}>Waiting for output…</Text>
      </Box>
    );
  }

  const [start, end] = visibleRange(events.length, selectedIndex, visibleCount);
  return (
    <Box flexDirection="column" gap={1}>
      {start > 0 && <Text color={theme.muted}>↑ {start} earlier events</Text>}
      {events.slice(start, end).map((event, offset) => {
        const index = start + offset;
        return (
          <EventCard
            key={event.id}
            event={event}
            selected={index === selectedIndex}
            expanded={expandedIds.has(event.id)}
          />
        );
      })}
      {end < events.length && <Text color={theme.muted}>↓ {events.length - end} later events</Text>}
    </Box>
  );
};
