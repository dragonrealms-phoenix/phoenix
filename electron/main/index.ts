import { config as initializeDotenv } from 'dotenv-flow';
import { initializeLogging } from './logger';
import { initializeSentry } from './sentry';

initializeDotenv();
initializeLogging();
initializeSentry();

import './app';
