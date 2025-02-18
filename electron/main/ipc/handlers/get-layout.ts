import type { Layout } from '../../../common/layout/types.js';
import type { Maybe } from '../../../common/types.js';
import type { LayoutService } from '../../layout/types.js';
import { logger } from '../logger.js';
import type { IpcInvokeHandler } from '../types.js';

export const getLayoutHandler = (options: {
  layoutService: LayoutService;
}): IpcInvokeHandler<'getLayout'> => {
  const { layoutService } = options;

  return async (args): Promise<Maybe<Layout>> => {
    const { layoutName } = args[0];

    logger.debug('getLayoutHandler', {
      layoutName,
    });

    return layoutService.getLayout({
      layoutName,
    });
  };
};
