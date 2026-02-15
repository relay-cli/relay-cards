export class LineBuffer {
  #remainder = '';

  push(chunk: string | Buffer): string[] {
    const text = this.#remainder + chunk.toString('utf8');
    const parts = text.split(/\r?\n/);
    this.#remainder = parts.pop() ?? '';
    return parts;
  }

  flush(): string[] {
    if (this.#remainder.length === 0) {
      return [];
    }

    const finalLine = this.#remainder;
    this.#remainder = '';
    return [finalLine];
  }
}
