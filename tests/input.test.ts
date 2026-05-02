import {describe, expect, it} from 'vitest';
import {LineBuffer, normalizeLine} from '../src/input/index.js';

describe('LineBuffer', () => {
  it('joins partial chunks without losing lines', () => {
    const buffer = new LineBuffer();
    expect(buffer.push('one\ntw')).toEqual(['one']);
    expect(buffer.push('o\r\nthree')).toEqual(['two']);
    expect(buffer.flush()).toEqual(['three']);
  });

  it('does not invent a line when the buffer is empty', () => {
    expect(new LineBuffer().flush()).toEqual([]);
  });
});

describe('normalizeLine', () => {
  it('removes ANSI and unsupported control characters', () => {
    expect(normalizeLine('\u001B[31merror\u001B[0m\u0000  ')).toBe('error');
  });
});
