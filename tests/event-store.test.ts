import {describe, expect, it, vi} from 'vitest';
import {createEventBase, type TextEvent} from '../src/events/index.js';
import {EventStore} from '../src/store/index.js';

const textEvent = (message: string, milliseconds: number): TextEvent => ({
  ...createEventBase({
    stream: 'stdout',
    raw: message,
    timestamp: new Date(milliseconds),
  }),
  kind: 'text',
  message,
});

describe('EventStore', () => {
  it('retains only the configured number of events', () => {
    const store = new EventStore({limit: 2});
    store.appendMany([textEvent('one', 1), textEvent('two', 2), textEvent('three', 3)]);
    expect(store.getSnapshot().map((event) => event.raw)).toEqual(['two', 'three']);
  });

  it('coalesces consecutive duplicate events inside the window', () => {
    const store = new EventStore({limit: 10, coalesceWithinMs: 100});
    store.append(textEvent('heartbeat', 0));
    store.append(textEvent('heartbeat', 50));
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0]?.repeat).toBe(2);
  });

  it('keeps duplicate events outside the window separate', () => {
    const store = new EventStore({limit: 10, coalesceWithinMs: 100});
    store.append(textEvent('heartbeat', 0));
    store.append(textEvent('heartbeat', 101));
    expect(store.getSnapshot()).toHaveLength(2);
  });

  it('notifies subscribers when history changes', () => {
    const store = new EventStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.append(textEvent('hello', 0));
    store.clear();
    unsubscribe();
    store.append(textEvent('goodbye', 1));
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
