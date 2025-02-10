import type { LayoutService } from '../../layout/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const saveLayoutHandler = (options: {
  layoutService: LayoutService;
}): IpcInvokeHandler<'saveLayout'> => {
  const { layoutService } = options;

  return async (args): Promise<void> => {
    const { layoutName, layout } = args[0];

    logger.debug('saveLayoutHandler', {
      layoutName,
      layout,
    });

    return layoutService.saveLayout({
      layoutName,
      layout,
    });
  };
};
