import { app } from 'electron';
import path from 'node:path';
import { LayoutServiceImpl } from './layout.service.js';

// There is exactly one layout instance so that it's
// easy anywhere in the app to manage layouts.
export const Layouts = new LayoutServiceImpl({
  baseDir: path.join(app.getPath('userData'), 'layouts'),
});
