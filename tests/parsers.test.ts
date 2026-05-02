import {describe, expect, it} from 'vitest';
import {ParserPipeline, parseHttpLine, parseJsonLine} from '../src/parsers/index.js';

const timestamp = new Date('2026-01-02T03:04:05.000Z');
const context = {stream: 'stdout' as const, timestamp};

describe('structured parsers', () => {
  it('parses JSON objects and derives a label', () => {
    const event = parseJsonLine('{"event":"cache.refresh","entries":48}', context);
    expect(event).toMatchObject({
      kind: 'json',
      label: 'cache.refresh',
      data: {event: 'cache.refresh', entries: 48},
      timestamp,
    });
  });

  it('leaves malformed JSON for the fallback parser', () => {
    expect(parseJsonLine('{"broken":', context)).toBeUndefined();
  });

  it('parses common access logs', () => {
    const event = parseHttpLine(
      '127.0.0.1 - - [02/Jan/2026:03:04:05 +0000] "GET /health HTTP/1.1" 200 18',
      context,
    );
    expect(event).toMatchObject({
      kind: 'http',
      method: 'GET',
      path: '/health',
      status: 200,
      bytes: 18,
      remoteAddress: '127.0.0.1',
    });
  });

  it('recognizes structured HTTP records before generic JSON', () => {
    const pipeline = new ParserPipeline();
    const [event] = pipeline.push(
      '{"method":"POST","path":"/users","status":201,"durationMs":12.5}',
      'stdout',
      timestamp,
    );
    expect(event).toMatchObject({
      kind: 'http',
      method: 'POST',
      path: '/users',
      status: 201,
      durationMs: 12.5,
    });
  });
});

describe('parser pipeline', () => {
  it('groups an error and its stack frames', () => {
    const pipeline = new ParserPipeline();
    expect(pipeline.push('TypeError: Missing owner', 'stderr', timestamp)).toEqual([]);
    expect(pipeline.push('    at loadOwner (server.ts:8:3)', 'stderr', timestamp)).toEqual([]);
    const events = pipeline.push('request recovered', 'stdout', timestamp);

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      kind: 'error',
      message: 'TypeError: Missing owner',
      stack: '    at loadOwner (server.ts:8:3)',
    });
    expect(events[1]).toMatchObject({kind: 'text', message: 'request recovered'});
  });

  it('keeps invalid structured output as text', () => {
    const [event] = new ParserPipeline().push('{"broken":', 'stdout', timestamp);
    expect(event).toMatchObject({kind: 'text', message: '{"broken":'});
  });

  it('recognizes warnings', () => {
    const [event] = new ParserPipeline().push('WARN: Queue depth reached 72%', 'stderr');
    expect(event).toMatchObject({kind: 'warning', message: 'Queue depth reached 72%'});
  });
});
