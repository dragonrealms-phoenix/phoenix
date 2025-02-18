import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LayoutServiceMockImpl } from '../../../layout/__mocks__/layout-service.mock.js';
import { listLayoutNamesHandler } from '../list-layout-names.js';

vi.mock('../../../logger/logger.factory.ts');

describe('list-layout-names', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#listLayoutNamesHandler', async () => {
    it('lists layout names', async () => {
      const mockLayoutService = new LayoutServiceMockImpl();

      mockLayoutService.listLayoutNames.mockResolvedValue(['test-layout-name']);

      const handler = listLayoutNamesHandler({
        layoutService: mockLayoutService,
      });

      const result = await handler([]);

      expect(mockLayoutService.listLayoutNames).toHaveBeenCalled();

      expect(result).toEqual(['test-layout-name']);
    });
  });
});
