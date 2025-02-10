import type { LayoutService } from '../../layout/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const listLayoutNamesHandler = (options: {
  layoutService: LayoutService;
}): IpcInvokeHandler<'listLayoutNames'> => {
  const { layoutService } = options;

  return async (_args): Promise<Array<string>> => {
    logger.debug('listLayoutNamesHandler');

    return layoutService.listLayoutNames();
  };
};
