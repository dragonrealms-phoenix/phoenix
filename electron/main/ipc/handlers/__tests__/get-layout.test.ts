import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Layout } from '../../../../common/layout/types.js';
import { LayoutServiceMockImpl } from '../../../layout/__mocks__/layout-service.mock.js';
import { getLayoutHandler } from '../get-layout.js';

vi.mock('../../../logger/logger.factory.ts');

describe('get-layout', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('#getLayoutHandler', async () => {
    const mockLayout: Layout = {
      window: {
        x: 1,
        y: 2,
        width: 3,
        height: 4,
      },
      items: [
        {
          id: 'test-stream-id',
          title: 'test-stream-title',
          visible: true,
          x: 1,
          y: 2,
          width: 3,
          height: 4,
          textFont: 'test-text-font',
          textSize: 5,
          backgroundColor: 'test-background-color',
          foregroundColor: 'test-foreground-color',
          whenHiddenRedirectToId: 'test-when-hidden-redirect-to-id',
        },
      ],
    };

    it('gets a layout', async () => {
      const mockLayoutService = new LayoutServiceMockImpl();

      mockLayoutService.getLayout.mockResolvedValue(mockLayout);

      const handler = getLayoutHandler({
        layoutService: mockLayoutService,
      });

      const result = await handler([
        {
          layoutName: 'test-layout-name',
        },
      ]);

      expect(mockLayoutService.getLayout).toHaveBeenCalledWith({
        layoutName: 'test-layout-name',
      });

      expect(result).toEqual(mockLayout);
    });
  });
});
