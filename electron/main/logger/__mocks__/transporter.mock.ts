import type { MockedFunction } from 'vitest';
import { vi } from 'vitest';
import type { LogTransporter } from '../types.js';

export interface LogTransporterMock extends LogTransporter {
  transport: MockedFunction<LogTransporter['transport']>;
}

export class LogTransporterMockImpl implements LogTransporterMock {
  transport = vi.fn<LogTransporter['transport']>();
}
