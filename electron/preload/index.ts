import { contextBridge, ipcRenderer } from 'electron';

/**
 * The index.d.ts file is auto-generated by the build process.
 */

// Custom APIs for renderer
export const appAPI = {
  ping: async (): Promise<string> => {
    // Proxies request to the main process then returns any response
    return ipcRenderer.invoke('ping');
  },
};

declare global {
  type AppAPI = typeof appAPI;

  interface Window {
    api: AppAPI;
  }
}

contextBridge.exposeInMainWorld('api', appAPI);