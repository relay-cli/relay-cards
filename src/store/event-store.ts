import type {RelayEvent} from '../events/index.js';

export type EventStoreListener = () => void;

export class EventStore {
  readonly #limit: number;
  #events: readonly RelayEvent[] = [];
  readonly #listeners = new Set<EventStoreListener>();

  constructor(limit = 500) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError('Event history limit must be a positive integer.');
    }
    this.#limit = limit;
  }

  append(event: RelayEvent): void {
    const next = [...this.#events, event];
    this.#events = next.length > this.#limit ? next.slice(next.length - this.#limit) : next;
    this.#emit();
  }

  appendMany(events: readonly RelayEvent[]): void {
    if (events.length === 0) {
      return;
    }
    const next = [...this.#events, ...events];
    this.#events = next.length > this.#limit ? next.slice(next.length - this.#limit) : next;
    this.#emit();
  }

  clear(): void {
    if (this.#events.length === 0) {
      return;
    }
    this.#events = [];
    this.#emit();
  }

  getSnapshot = (): readonly RelayEvent[] => this.#events;

  subscribe = (listener: EventStoreListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  #emit(): void {
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
