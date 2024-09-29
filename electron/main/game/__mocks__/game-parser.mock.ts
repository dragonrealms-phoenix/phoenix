import type { Mocked } from 'vitest';
import { vi } from 'vitest';
import type { GameParser } from '../types.js';

export class GameParserMockImpl implements Mocked<GameParser> {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  parse = vi.fn<GameParser['parse']>();
}
