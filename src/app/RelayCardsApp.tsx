import {useEffect, useMemo, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import type {EventStore} from '../store/index.js';
import type {RelayEventKind} from '../events/index.js';
import {theme} from '../ui/index.js';
import {CardFeed} from './CardFeed.js';
import {allEventKinds, filterEvents} from './filter-events.js';
import {HelpOverlay} from './HelpOverlay.js';
import {RawFeed} from './RawFeed.js';
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
  const [enabledKinds, setEnabledKinds] = useState<ReadonlySet<RelayEventKind>>(
    new Set(allEventKinds),
  );
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [rawMode, setRawMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const filteredEvents = useMemo(
    () => filterEvents(events, enabledKinds, query),
    [enabledKinds, events, query],
  );

  useEffect(() => {
    if (following) {
      setSelectedIndex(Math.max(0, filteredEvents.length - 1));
    } else {
      setSelectedIndex((current) => Math.min(current, Math.max(0, filteredEvents.length - 1)));
    }
  }, [filteredEvents.length, following]);

  useInput((input, key) => {
    if (showHelp) {
      if (input === '?' || input === 'q' || key.escape) setShowHelp(false);
      return;
    }
    if (searching) {
      if (key.escape || key.return) {
        setSearching(false);
      } else if (key.backspace || key.delete) {
        setQuery((current) => current.slice(0, -1));
      } else if (!key.ctrl && !key.meta && input.length === 1) {
        setQuery((current) => current + input);
      }
      return;
    }
    if (input === '/') {
      setSearching(true);
      return;
    }
    if (input === '?') {
      setShowHelp(true);
      return;
    }
    if (input === 'r') {
      setRawMode((current) => !current);
      return;
    }
    const kindByNumber: Record<string, RelayEventKind> = {
      '1': 'http',
      '2': 'json',
      '3': 'error',
      '4': 'warning',
      '5': 'process',
      '6': 'text',
    };
    const kind = kindByNumber[input];
    if (kind !== undefined) {
      setEnabledKinds((current) => {
        const next = new Set(current);
        if (next.has(kind)) next.delete(kind);
        else next.add(kind);
        return next;
      });
      return;
    }
    if (input === 'j' || key.downArrow) {
      setSelectedIndex((current) => {
        const next = Math.min(filteredEvents.length - 1, current + 1);
        setFollowing(next === filteredEvents.length - 1);
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
      setSelectedIndex(Math.max(0, filteredEvents.length - 1));
    }
    if (key.return || input === ' ') {
      const selected = filteredEvents[selectedIndex];
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
        {showHelp ? (
          <HelpOverlay />
        ) : rawMode ? (
          <RawFeed events={filteredEvents} visibleCount={(visibleCount ?? 5) * 3} />
        ) : (
          <CardFeed
            events={filteredEvents}
            selectedIndex={selectedIndex}
            expandedIds={expandedIds}
            {...(visibleCount === undefined ? {} : {visibleCount})}
          />
        )}
      </Box>
      <Text color={theme.muted}>
        {filteredEvents.length}/{events.length} events · {rawMode ? 'raw' : 'cards'} · r view · 1–6
        types · / search
      </Text>
      {(searching || query !== '') && (
        <Text color={searching ? theme.blue : theme.muted}>
          search: {query || 'type to filter…'}
        </Text>
      )}
    </Box>
  );
};
