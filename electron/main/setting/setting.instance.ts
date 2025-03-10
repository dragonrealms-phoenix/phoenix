import { app } from 'electron';
import path from 'node:path';
import { HighlightSettingServiceImpl } from './highlight/highlight.service.js';
import { SettingServiceImpl } from './setting.service.js';

// There is exactly one setting service instance so that it's
// easy anywhere in the app to get/set settings.
export const Settings = new SettingServiceImpl({
  baseDir: path.join(app.getPath('userData'), 'phoenix', 'settings'),
  highlightService: new HighlightSettingServiceImpl(),
});
