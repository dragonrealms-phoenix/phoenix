import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LayoutServiceMockImpl } from '../../../layout/__mocks__/layout-service.mock.js';
import { deleteLayoutHandler } from '../delete-layout.js';

vi.mock('../../../logger/logger.factory.ts');

describe('delete-layout', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#deleteLayoutHandler', async () => {
    it('deletes a layout', async () => {
      const mockLayoutService = new LayoutServiceMockImpl();

      const handler = deleteLayoutHandler({
        layoutService: mockLayoutService,
      });

      await handler([
        {
          layoutName: 'test-layout-name',
        },
      ]);

      expect(mockLayoutService.deleteLayout).toHaveBeenCalledWith({
        layoutName: 'test-layout-name',
      });
    });
  });
});
