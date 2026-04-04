import {useEffect, useState} from 'react';
import {Box, Text} from 'ink';
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

  useEffect(() => {
    setSelectedIndex(Math.max(0, events.length - 1));
  }, [events.length]);

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
          {...(visibleCount === undefined ? {} : {visibleCount})}
        />
      </Box>
      <Text color={theme.muted}>{events.length} events · press ? for help</Text>
    </Box>
  );
};
