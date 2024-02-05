import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  installChromeExtensions,
  installReactDevTools,
} from '../install-extension.js';

const { mockInstallExtension } = vi.hoisted(() => {
  return {
    mockInstallExtension: vi.fn(),
  };
});

vi.mock('electron-extension-installer', () => {
  return {
    REACT_DEVELOPER_TOOLS: 'REACT_DEVELOPER_TOOLS',
    installExtension: mockInstallExtension,
  };
});

describe('install-extension', () => {
  beforeEach(() => {
    //
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('#installChromeExtensions', () => {
    it('installs all extensions', async () => {
      await installChromeExtensions();

      expect(mockInstallExtension).toHaveBeenCalledWith(
        'REACT_DEVELOPER_TOOLS',
        {
          loadExtensionOptions: {
            allowFileAccess: true,
          },
        }
      );

      // There's only the one extension supported right now.
      // If others were installed we'd assert them here.
    });
  });

  describe('#installReactDevTools', () => {
    it('installs the extension', async () => {
      await installReactDevTools();

      expect(mockInstallExtension).toHaveBeenCalledWith(
        'REACT_DEVELOPER_TOOLS',
        {
          loadExtensionOptions: {
            allowFileAccess: true,
          },
        }
      );
    });
  });
});
