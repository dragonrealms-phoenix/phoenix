import dotenv from 'dotenv';
import { initializeLogging } from './logger';
import { initializeSentry } from './sentry';

dotenv.config();

initializeLogging();
initializeSentry();

import './app';
