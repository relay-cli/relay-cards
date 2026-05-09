import {describe, expect, it} from 'vitest';
import {render} from 'ink-testing-library';
import {createEventBase, type HttpEvent, type JsonEvent} from '../src/events/index.js';
import {HelpOverlay} from '../src/app/index.js';
import {EventCard} from '../src/ui/index.js';

const timestamp = new Date('2026-01-02T03:04:05.000Z');

describe('terminal cards', () => {
  it('shows the important HTTP fields', () => {
    const event: HttpEvent = {
      ...createEventBase({stream: 'stdout', raw: 'GET /health 200', timestamp}),
      kind: 'http',
      method: 'GET',
      path: '/health',
      status: 200,
      durationMs: 4.2,
    };
    const {lastFrame} = render(<EventCard event={event} selected />);
    expect(lastFrame()).toContain('HTTP request');
    expect(lastFrame()).toContain('GET');
    expect(lastFrame()).toContain('/health');
    expect(lastFrame()).toContain('200');
    expect(lastFrame()).toContain('4.2 ms');
  });

  it('pretty prints expanded structured data', () => {
    const event: JsonEvent = {
      ...createEventBase({stream: 'stdout', raw: '{"event":"ready"}', timestamp}),
      kind: 'json',
      label: 'ready',
      data: {event: 'ready', workers: 3},
    };
    const {lastFrame} = render(<EventCard event={event} expanded />);
    expect(lastFrame()).toContain('"workers": 3');
  });

  it('lists every documented keyboard control', () => {
    const {lastFrame} = render(<HelpOverlay />);
    expect(lastFrame()).toContain('Relay Cards controls');
    expect(lastFrame()).toContain('pause or resume');
    expect(lastFrame()).toContain('stop the command and exit');
  });
});
