import { config as initializeDotenv } from 'dotenv';
import { initializeLogging } from './logger';
import { initializeSentry } from './sentry';

initializeDotenv();
initializeLogging();
initializeSentry();

import './app';
