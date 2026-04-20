import type {RelayEvent, RelayEventKind} from '../events/index.js';

export const allEventKinds: readonly RelayEventKind[] = [
  'http',
  'json',
  'error',
  'warning',
  'process',
  'text',
];

export const filterEvents = (
  events: readonly RelayEvent[],
  kinds: ReadonlySet<RelayEventKind>,
  query: string,
): readonly RelayEvent[] => {
  const normalizedQuery = query.trim().toLowerCase();
  return events.filter(
    (event) =>
      kinds.has(event.kind) &&
      (normalizedQuery === '' || event.raw.toLowerCase().includes(normalizedQuery)),
  );
};
