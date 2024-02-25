import { afterEach, describe, expect, it, vi } from 'vitest';
import { initializeSentry } from '../initialize-sentry.js';

type SentryElectronMainModule = typeof import('@sentry/electron/main');

const { mockSentryElectronMain } = vi.hoisted(() => {
  const mockSentryElectronMain: Partial<SentryElectronMainModule> = {
    init: vi.fn(),
  };

  return {
    mockSentryElectronMain,
  };
});

vi.mock('@sentry/electron/main', () => {
  return mockSentryElectronMain;
});

describe('initialize-sentry', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('initializes the sentry electron module', () => {
    vi.stubEnv('SENTRY_DSN', 'test:sentry:dsn');

    initializeSentry();

    expect(mockSentryElectronMain.init).toHaveBeenCalledWith({
      dsn: 'test:sentry:dsn',
      tracesSampleRate: 1,
      normalizeDepth: 5,
      debug: false,
    });
  });
});
