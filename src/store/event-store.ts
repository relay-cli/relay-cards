import type {RelayEvent} from '../events/index.js';

export type EventStoreListener = () => void;

export interface EventStoreOptions {
  limit?: number;
  coalesceWithinMs?: number;
}

export class EventStore {
  readonly #limit: number;
  readonly #coalesceWithinMs: number;
  #events: readonly RelayEvent[] = [];
  readonly #listeners = new Set<EventStoreListener>();

  constructor(options: number | EventStoreOptions = {}) {
    const limit = typeof options === 'number' ? options : (options.limit ?? 500);
    const coalesceWithinMs = typeof options === 'number' ? 1000 : (options.coalesceWithinMs ?? 1000);
    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError('Event history limit must be a positive integer.');
    }
    if (!Number.isFinite(coalesceWithinMs) || coalesceWithinMs < 0) {
      throw new RangeError('Coalescing window must be a non-negative number.');
    }
    this.#limit = limit;
    this.#coalesceWithinMs = coalesceWithinMs;
  }

  append(event: RelayEvent): void {
    this.#appendWithoutEmitting(event);
    this.#emit();
  }

  appendMany(events: readonly RelayEvent[]): void {
    if (events.length === 0) {
      return;
    }
    for (const event of events) {
      this.#appendWithoutEmitting(event);
    }
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

  #appendWithoutEmitting(event: RelayEvent): void {
    const previous = this.#events.at(-1);
    if (
      previous !== undefined &&
      previous.kind === event.kind &&
      previous.stream === event.stream &&
      previous.raw === event.raw &&
      event.timestamp.getTime() - previous.timestamp.getTime() <= this.#coalesceWithinMs
    ) {
      this.#events = [
        ...this.#events.slice(0, -1),
        {...previous, timestamp: event.timestamp, repeat: previous.repeat + event.repeat},
      ];
      return;
    }

    const next = [...this.#events, event];
    this.#events = next.length > this.#limit ? next.slice(next.length - this.#limit) : next;
  }

  #emit(): void {
    for (const listener of this.#listeners) {
      listener();
    }
  }
}
