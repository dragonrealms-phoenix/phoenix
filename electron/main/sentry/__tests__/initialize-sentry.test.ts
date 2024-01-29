import { describe, expect, it, vi } from 'vitest';
import { initializeSentry } from '../initialize-sentry.js';

type SentryElectronMainModule = typeof import('@sentry/electron/main');

const { sentryElectronMainMock } = vi.hoisted(() => {
  const sentryElectronMainMock: Partial<SentryElectronMainModule> = {
    init: vi.fn(),
  };

  return {
    sentryElectronMainMock,
  };
});

vi.mock('@sentry/electron/main', () => {
  return sentryElectronMainMock;
});

describe('initialize-sentry', () => {
  it('initializes the sentry electron module', () => {
    process.env.SENTRY_DSN = 'test:sentry:dsn';

    initializeSentry();

    expect(sentryElectronMainMock.init).toHaveBeenCalledWith({
      dsn: 'test:sentry:dsn',
      tracesSampleRate: 1,
      normalizeDepth: 5,
      debug: false,
    });
  });
});
