import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pingHandler } from '../ping.js';

describe('ping', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#pingHandler', async () => {
    it('dispatches and returns a pong response', async () => {
      const mockIpcDispatcher = vi.fn();

      const handler = pingHandler({
        dispatch: mockIpcDispatcher,
      });

      const response = await handler([]);

      expect(response).toEqual('pong');
      expect(mockIpcDispatcher).toHaveBeenCalledWith('pong', response);
    });
  });
});
