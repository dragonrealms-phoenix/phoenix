import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createLogger } from './logger';
import { initializeSentry } from './sentry';

import './assets/index.css';

initializeSentry();

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
