import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import type {RelayEvent} from '../src/events/index.js';
import {runCommand} from '../src/process/index.js';

const fixture = fileURLToPath(new URL('./fixtures/emitter.mjs', import.meta.url));

describe('runCommand', () => {
  it('emits parsed output and preserves the exit code', async () => {
    const events: RelayEvent[] = [];
    const running = runCommand([process.execPath, fixture], {
      onEvent: (event) => events.push(event),
    });
    const result = await running.completion;

    expect(result.exitCode).toBe(7);
    expect(events.some((event) => event.kind === 'http')).toBe(true);
    expect(
      events.some((event) => event.kind === 'warning' && event.message === 'fixture warning'),
    ).toBe(true);
    const errorIndex = events.findIndex((event) => event.kind === 'error');
    const followingTextIndex = events.findIndex(
      (event) => event.kind === 'text' && event.raw === 'after error',
    );
    expect(errorIndex).toBeGreaterThan(-1);
    expect(followingTextIndex).toBeGreaterThan(errorIndex);
    expect(events.at(0)).toMatchObject({kind: 'process', state: 'starting'});
    expect(events.at(-1)).toMatchObject({kind: 'process', state: 'exited', exitCode: 7});
  });
});
