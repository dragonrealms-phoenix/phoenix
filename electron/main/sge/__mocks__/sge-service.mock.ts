import { vi } from 'vitest';
import type { SGEService } from '../types.js';

export class SGEServiceMock implements SGEService {
  loginCharacter = vi.fn();
  listCharacters = vi.fn();
}
