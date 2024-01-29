import { vi } from 'vitest';
import type { PreferenceService } from '../types.js';

export class PreferenceServiceMock implements PreferenceService {
  get = vi.fn();
  set = vi.fn();
  remove = vi.fn();
}
