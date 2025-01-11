import type { MockedFunction } from 'vitest';
import { vi } from 'vitest';
import type { LogFormatter } from '../types.js';

export type LogFormatterMock = MockedFunction<LogFormatter>;

export const mockLogFormatterFactory = (): LogFormatterMock => {
  return vi.fn<LogFormatter>();
};
