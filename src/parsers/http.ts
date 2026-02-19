import {createEventBase, type HttpEvent} from '../events/index.js';
import type {LineParser, ParseContext} from './types.js';

const accessLogPattern =
  /^(?<remote>\S+)\s+\S+\s+\S+\s+\[[^\]]+\]\s+"(?<method>[A-Z]+)\s+(?<path>\S+)(?:\s+HTTP\/\d(?:\.\d)?)?"\s+(?<status>\d{3})\s+(?<bytes>\d+|-)/;

const simpleHttpPattern =
  /^(?:\[[^\]]+\]\s+)?(?<method>GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(?<path>\/\S*)\s+(?<status>\d{3})(?:\s+(?<duration>\d+(?:\.\d+)?)\s*ms)?(?:\s+(?<bytes>\d+)\s*(?:b|bytes))?$/i;

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
};

const createHttpEvent = (
  line: string,
  context: ParseContext,
  fields: Omit<HttpEvent, keyof ReturnType<typeof createEventBase> | 'kind' | 'repeat'>,
): HttpEvent => ({
  ...createEventBase({stream: context.stream, raw: line, timestamp: context.timestamp}),
  kind: 'http',
  ...fields,
});

const parseJsonHttp = (line: string, context: ParseContext): HttpEvent | undefined => {
  if (!line.trimStart().startsWith('{')) {
    return undefined;
  }

  try {
    const value: unknown = JSON.parse(line);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return undefined;
    }

    const method = Reflect.get(value, 'method');
    const path = Reflect.get(value, 'path') ?? Reflect.get(value, 'url');
    const status = asNumber(Reflect.get(value, 'status') ?? Reflect.get(value, 'statusCode'));
    if (typeof method !== 'string' || typeof path !== 'string' || status === undefined) {
      return undefined;
    }

    const durationMs = asNumber(
      Reflect.get(value, 'durationMs') ?? Reflect.get(value, 'responseTime'),
    );
    const bytes = asNumber(Reflect.get(value, 'bytes') ?? Reflect.get(value, 'contentLength'));
    const remoteAddress = Reflect.get(value, 'remoteAddress');

    return createHttpEvent(line, context, {
      method: method.toUpperCase(),
      path,
      status,
      ...(durationMs === undefined ? {} : {durationMs}),
      ...(bytes === undefined ? {} : {bytes}),
      ...(typeof remoteAddress === 'string' ? {remoteAddress} : {}),
    });
  } catch {
    return undefined;
  }
};

export const parseHttpLine: LineParser = (line, context) => {
  const jsonEvent = parseJsonHttp(line, context);
  if (jsonEvent !== undefined) {
    return jsonEvent;
  }

  const accessMatch = accessLogPattern.exec(line);
  if (accessMatch?.groups !== undefined) {
    const bytes = accessMatch.groups.bytes;
    return createHttpEvent(line, context, {
      method: accessMatch.groups.method ?? 'GET',
      path: accessMatch.groups.path ?? '/',
      status: Number(accessMatch.groups.status),
      ...(bytes === undefined || bytes === '-' ? {} : {bytes: Number(bytes)}),
      ...(accessMatch.groups.remote === undefined
        ? {}
        : {remoteAddress: accessMatch.groups.remote}),
    });
  }

  const simpleMatch = simpleHttpPattern.exec(line.trim());
  if (simpleMatch?.groups === undefined) {
    return undefined;
  }

  return createHttpEvent(line, context, {
    method: (simpleMatch.groups.method ?? 'GET').toUpperCase(),
    path: simpleMatch.groups.path ?? '/',
    status: Number(simpleMatch.groups.status),
    ...(simpleMatch.groups.duration === undefined
      ? {}
      : {durationMs: Number(simpleMatch.groups.duration)}),
    ...(simpleMatch.groups.bytes === undefined ? {} : {bytes: Number(simpleMatch.groups.bytes)}),
  });
};
