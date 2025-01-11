import type { MockedFunction } from 'vitest';
import { WritableMockImpl } from '../../__mocks__/writable.mock.js';
import type { LogTransport } from '../types.js';

export interface LogTransportMock extends LogTransport {
  writable: boolean;
  write: MockedFunction<WritableMockImpl['write']>;
  on: MockedFunction<(...args: Parameters<WritableMockImpl['on']>) => this>;
  once: MockedFunction<(...args: Parameters<WritableMockImpl['once']>) => this>;
  off: MockedFunction<(...args: Parameters<WritableMockImpl['off']>) => this>;
  emit: MockedFunction<WritableMockImpl['emit']>;
}

export class LogTransportMockImpl
  extends WritableMockImpl
  implements LogTransportMock {}
