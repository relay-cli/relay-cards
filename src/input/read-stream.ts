import type {Readable} from 'node:stream';
import type {EventStream, RelayEvent} from '../events/index.js';
import {ParserPipeline} from '../parsers/index.js';
import {LineBuffer} from './line-buffer.js';

export interface ReadEventStreamOptions {
  stream?: EventStream;
  onEvent: (event: RelayEvent) => void;
  signal?: AbortSignal;
}

export const readEventStream = async (
  readable: Readable,
  options: ReadEventStreamOptions,
): Promise<void> => {
  const stream = options.stream ?? 'stdout';
  const lineBuffer = new LineBuffer();
  const parser = new ParserPipeline();

  const emit = (lines: readonly string[]): void => {
    for (const line of lines) {
      for (const event of parser.push(line, stream)) {
        options.onEvent(event);
      }
    }
  };

  const abort = (): void => readable.destroy(new Error('Input stream aborted.'));
  options.signal?.addEventListener('abort', abort, {once: true});

  try {
    for await (const chunk of readable) {
      if (options.signal?.aborted === true) {
        break;
      }
      emit(lineBuffer.push(Buffer.isBuffer(chunk) ? chunk : String(chunk)));
    }

    emit(lineBuffer.flush());
    for (const event of parser.flush()) {
      options.onEvent(event);
    }
  } finally {
    options.signal?.removeEventListener('abort', abort);
  }
};
