import { app } from 'electron';
import { config as initializeDotenv } from 'dotenv-flow';
import { initializeSentry } from './sentry/initialize-sentry.js';

// Unfortunately in development mode, the app name is 'Electron'.
// The paths to logs, user data, etc is based on the app name.
// To ensure a consistent app name for all environments, we set it first.
// Otherwise, packages like electron-log will use the wrong paths.
app.setName('Phoenix');
app.setAppUserModelId('com.github.dragonrealms-phoenix.phoenix');

initializeDotenv();
initializeSentry();

// Once electron-log is initialized then it's safe for us to
// import and use other modules that depend on logging.
// Otherwise, those modules prematurely create logger instances.
// To ensure no imported module (or their dependencies) loads prematurely,
// then we dynamically import the app initialization module at the right time.
const { initializeApp } = await import('./initialize-app.js');
await initializeApp();
