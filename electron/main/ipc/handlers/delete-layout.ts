import type { LayoutService } from '../../layout/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const deleteLayoutHandler = (options: {
  layoutService: LayoutService;
}): IpcInvokeHandler<'deleteLayout'> => {
  const { layoutService } = options;

  return async (args): Promise<void> => {
    const { layoutName } = args[0];

    logger.debug('deleteLayoutHandler', {
      layoutName,
    });

    return layoutService.deleteLayout({
      layoutName,
    });
  };
};
