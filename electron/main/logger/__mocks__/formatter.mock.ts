import type { MockedFunction } from 'vitest';
import { vi } from 'vitest';
import type { LogFormatter } from '../types.js';

export interface LogFormatterMock extends LogFormatter {
  format: MockedFunction<LogFormatter['format']>;
}

export class LogFormatterMockImpl implements LogFormatterMock {
  format = vi.fn<LogFormatter['format']>();
}
