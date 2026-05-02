import {describe, expect, it} from 'vitest';
import {parseCliOptions} from '../src/cli/options.js';
import {createEventBase, type HttpEvent} from '../src/events/index.js';
import {formatPlainEvent} from '../src/output/index.js';

describe('parseCliOptions', () => {
  it('keeps command arguments after the separator', () => {
    expect(parseCliOptions(['--history', '25', '--', 'npm', 'run', 'dev'])).toMatchObject({
      history: 25,
      command: ['npm', 'run', 'dev'],
    });
  });

  it('accepts a command without a separator', () => {
    expect(parseCliOptions(['node', 'server.js']).command).toEqual(['node', 'server.js']);
  });

  it('rejects unknown options', () => {
    expect(() => parseCliOptions(['--mystery'])).toThrow('Unknown option');
  });

  it('rejects invalid history limits', () => {
    expect(() => parseCliOptions(['--history', '0'])).toThrow('positive integer');
  });
});

describe('formatPlainEvent', () => {
  it('formats HTTP events without terminal control codes', () => {
    const event: HttpEvent = {
      ...createEventBase({
        stream: 'stdout',
        raw: 'GET /health 200 4ms',
        timestamp: new Date('2026-01-02T03:04:05.000Z'),
      }),
      kind: 'http',
      method: 'GET',
      path: '/health',
      status: 200,
      durationMs: 4,
    };
    expect(formatPlainEvent(event)).toBe('2026-01-02T03:04:05.000Z [http] GET /health 200 4ms');
  });
});
