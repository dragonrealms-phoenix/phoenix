import { LayoutServiceImpl } from './layout.service.js';

// There is exactly one layout instance so that it's
// easy anywhere in the app to manage layouts.
export const Layouts = new LayoutServiceImpl();
