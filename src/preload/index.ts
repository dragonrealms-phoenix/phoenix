import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { appAPI } from './api';

contextBridge.exposeInMainWorld('electron', electronAPI);
contextBridge.exposeInMainWorld('api', appAPI);
