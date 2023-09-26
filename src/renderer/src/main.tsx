import * as Sentry from '@sentry/electron/renderer';
import { init as reactInit } from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createLogger } from './logger';

import './assets/index.css';

// TODO move to a sentry init file
Sentry.init(
  {
    dsn: import.meta.env.RENDER_VITE_SENTRY_DSN,
    normalizeDepth: 5,
  },
  reactInit
);

const logger = createLogger('renderer');
logger.info('message from renderer');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.api.ping().then((response) => {
  logger.info(response); // pong
});
