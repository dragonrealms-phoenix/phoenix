// https://nextjs.org/docs/pages/building-your-application/optimizing/instrumentation

import { initializeLogging } from './lib/logger/initialize-logging.js';

export const register = async (): Promise<void> => {
  initializeLogging();
};
