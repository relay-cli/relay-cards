import {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import type {EventStore} from '../store/index.js';
import {theme} from '../ui/index.js';
import {CardFeed} from './CardFeed.js';
import {useEventStore} from './useEventStore.js';

export interface RelayCardsAppProps {
  store: EventStore;
  commandLabel: string;
  visibleCount?: number;
}

export const RelayCardsApp = ({store, commandLabel, visibleCount}: RelayCardsAppProps) => {
  const events = useEventStore(store);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [following, setFollowing] = useState(true);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (following) {
      setSelectedIndex(Math.max(0, events.length - 1));
    } else {
      setSelectedIndex((current) => Math.min(current, Math.max(0, events.length - 1)));
    }
  }, [events.length, following]);

  useInput((input, key) => {
    if (input === 'j' || key.downArrow) {
      setSelectedIndex((current) => {
        const next = Math.min(events.length - 1, current + 1);
        setFollowing(next === events.length - 1);
        return Math.max(0, next);
      });
    }
    if (input === 'k' || key.upArrow) {
      setFollowing(false);
      setSelectedIndex((current) => Math.max(0, current - 1));
    }
    if (input === 'g') {
      setFollowing(false);
      setSelectedIndex(0);
    }
    if (input === 'G') {
      setFollowing(true);
      setSelectedIndex(Math.max(0, events.length - 1));
    }
    if (key.return || input === ' ') {
      const selected = events[selectedIndex];
      if (selected === undefined) return;
      setExpandedIds((current) => {
        const next = new Set(current);
        if (next.has(selected.id)) next.delete(selected.id);
        else next.add(selected.id);
        return next;
      });
    }
  });

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" borderColor={theme.rule} paddingX={1}>
        <Text bold color={theme.text}>
          RELAY CARDS
        </Text>
        <Text color={theme.muted}> · {commandLabel}</Text>
      </Box>
      <Box flexDirection="column" paddingY={1}>
        <CardFeed
          events={events}
          selectedIndex={selectedIndex}
          expandedIds={expandedIds}
          {...(visibleCount === undefined ? {} : {visibleCount})}
        />
      </Box>
      <Text color={theme.muted}>
        {events.length} events · ↑/↓ move · enter expand · G follow · ? help
      </Text>
    </Box>
  );
};
