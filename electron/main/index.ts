import { config as initializeDotenv } from 'dotenv-flow';
import { initializeLogging } from './logger/initialize-logging.js';
import { initializeSentry } from './sentry/initialize-sentry.js';

initializeDotenv();
initializeLogging();
initializeSentry();

import './app.js';
