import type {RelayEvent} from '../events/index.js';

const eventSummary = (event: RelayEvent): string => {
  switch (event.kind) {
    case 'http':
      return `${event.method} ${event.path}${event.status === undefined ? '' : ` ${event.status}`}${
        event.durationMs === undefined ? '' : ` ${event.durationMs}ms`
      }`;
    case 'json':
      return JSON.stringify(event.data) ?? String(event.data);
    case 'error':
      return event.stack === undefined ? event.message : `${event.message}\n${event.stack}`;
    case 'warning':
      return event.message;
    case 'process':
      return `${event.state} ${event.command}${
        event.exitCode === undefined ? '' : ` (exit ${event.exitCode ?? 'signal'})`
      }`;
    case 'text':
      return event.message;
  }
};

export const formatPlainEvent = (event: RelayEvent): string => {
  const time = event.timestamp.toISOString();
  const repeat = event.repeat > 1 ? ` ×${event.repeat}` : '';
  return `${time} [${event.kind}] ${eventSummary(event)}${repeat}`;
};

export const writePlainEvent = (
  event: RelayEvent,
  writable: Pick<NodeJS.WriteStream, 'write'> = process.stdout,
): void => {
  writable.write(`${formatPlainEvent(event)}\n`);
};
