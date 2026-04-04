import {useSyncExternalStore} from 'react';
import type {RelayEvent} from '../events/index.js';
import type {EventStore} from '../store/index.js';

export const useEventStore = (store: EventStore): readonly RelayEvent[] =>
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
