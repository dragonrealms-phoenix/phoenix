import type { BrowserWindow } from 'electron';
import type { Mocked } from 'vitest';
import { vi } from 'vitest';

export const createBrowserWindowMock = (): Mocked<BrowserWindow> => {
  return new BrowserWindowMockImpl() as unknown as Mocked<BrowserWindow>;
};

class BrowserWindowMockImpl
  implements Mocked<Pick<BrowserWindow, 'setTitle' | 'isDestroyed'>>
{
  constructorSpy = vi.fn();

  constructor(...args: Array<any>) {
    this.constructorSpy(args);
  }

  setTitle = vi.fn<BrowserWindow['setTitle']>();

  isDestroyed = vi.fn<BrowserWindow['isDestroyed']>();

  webContents = {
    send: vi.fn<BrowserWindow['webContents']['send']>(),
  };
}

export { BrowserWindowMockImpl };
