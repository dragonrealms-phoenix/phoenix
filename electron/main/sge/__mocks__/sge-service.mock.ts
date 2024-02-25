import { vi } from 'vitest';
import type { SGEService } from '../types.js';

export class SGEServiceMockImpl implements SGEService {
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  loginCharacter = vi.fn<
    Parameters<SGEService['loginCharacter']>,
    ReturnType<SGEService['loginCharacter']>
  >();

  listCharacters = vi.fn<
    Parameters<SGEService['listCharacters']>,
    ReturnType<SGEService['listCharacters']>
  >();
}
