import { app } from 'electron';
import { config as initializeDotenv } from 'dotenv-flow';
import { initializeApp } from './initialize-app.js';
import { initializeSentry } from './sentry/initialize-sentry.js';

// Unfortunately in development mode, the app name is 'Electron'.
// The paths to logs, user data, etc is based on the app name.
// To ensure a consistent app name for all environments, we set it first.
// Otherwise, packages like electron-log will use the wrong paths.
app.setName('Phoenix');
app.setAppUserModelId('com.github.dragonrealms-phoenix.phoenix');

initializeDotenv();
initializeSentry();

await initializeApp();
