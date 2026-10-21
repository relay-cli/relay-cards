import {StringDecoder} from 'node:string_decoder';

export class LineBuffer {
  readonly #decoder = new StringDecoder('utf8');
  #remainder = '';

  push(chunk: string | Buffer): string[] {
    const decoded = typeof chunk === 'string' ? chunk : this.#decoder.write(chunk);
    const text = this.#remainder + decoded;
    const parts = text.split(/\r?\n/);
    this.#remainder = parts.pop() ?? '';
    return parts;
  }

  flush(): string[] {
    const finalLine = this.#remainder + this.#decoder.end();
    this.#remainder = '';
    if (finalLine.length === 0) {
      return [];
    }

    return [finalLine];
  }
}
