import { ipcRenderer } from 'electron';

// Custom APIs for renderer
export const appAPI = {
  ping: async (): Promise<string> => {
    // Proxies request to the main process then returns any response
    return ipcRenderer.invoke('ping');
  },
};

declare global {
  type AppAPI = typeof appAPI;
}
