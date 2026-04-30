export type EventStream = 'stdout' | 'stderr' | 'system';

export interface EventBase {
  id: string;
  timestamp: Date;
  stream: EventStream;
  raw: string;
  repeat: number;
}

export interface HttpEvent extends EventBase {
  kind: 'http';
  method: string;
  path: string;
  status?: number;
  durationMs?: number;
  bytes?: number;
  remoteAddress?: string;
}

export interface JsonEvent extends EventBase {
  kind: 'json';
  data: unknown;
  label?: string;
}

export interface ErrorEvent extends EventBase {
  kind: 'error';
  message: string;
  stack?: string;
}

export interface WarningEvent extends EventBase {
  kind: 'warning';
  message: string;
}

export interface ProcessEvent extends EventBase {
  kind: 'process';
  state: 'starting' | 'running' | 'stopping' | 'exited';
  command: string;
  pid?: number;
  exitCode?: number | null;
  signal?: NodeJS.Signals | null;
}

export interface TextEvent extends EventBase {
  kind: 'text';
  message: string;
}

export type RelayEvent =
  HttpEvent | JsonEvent | ErrorEvent | WarningEvent | ProcessEvent | TextEvent;

export type RelayEventKind = RelayEvent['kind'];
