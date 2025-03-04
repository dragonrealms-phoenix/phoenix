import { useCallback, useEffect, useState } from 'react';
import type { Layout } from '../../common/layout/types.js';
import type { Maybe } from '../../common/types.js';
import { runInBackground } from '../lib/async/run-in-background.js';
import type { PubSubEvent } from '../types/pubsub.types.js';
import { usePubSub, useSubscribe } from './pubsub.jsx';

/**
 * Gets the loaded layout name and the layout (if it exists).
 */
export const useLoadedLayout = (): {
  layoutName: string;
  layout: Maybe<Layout>;
} => {
  const [layoutName, setLayoutName] = useState<string>('default');
  const layout = useGetLayout(layoutName);

  useSubscribe('layout:load', (event: PubSubEvent.LayoutLoad) => {
    setLayoutName(event.layoutName);
  });

  return {
    layoutName,
    layout,
  };
};

/**
 * Gets the layout configuration for a given layout name.
 * Automatically refreshes the layout when it is saved or deleted.
 */
export const useGetLayout = (layoutName: string): Maybe<Layout> => {
  const [layout, setLayout] = useState<Layout>();

  const getLayout = useCallback(async () => {
    const layout = await window.api.getLayout({ layoutName });
    setLayout(layout);
  }, [layoutName]);

  // Reload when told to.
  useSubscribe('layouts:reload', async () => {
    await getLayout();
  });

  // Reload on first render.
  useEffect(() => {
    runInBackground(async () => {
      await getLayout();
    });
  }, [getLayout]);

  return layout;
};

/**
 * Returns a list of layout names the user can choose from.
 * Automatically refreshes the list when a layout is saved or deleted.
 */
export const useListLayoutNames = (): Array<string> => {
  const [layoutNames, setLayoutNames] = useState<Array<string>>([]);

  const listLayoutNames = useCallback(async () => {
    const layoutNames = await window.api.listLayoutNames();
    setLayoutNames(layoutNames);
  }, []);

  // Reload when told to.
  useSubscribe('layouts:reload', async () => {
    await listLayoutNames();
  });

  // Reload on first render.
  useEffect(() => {
    runInBackground(async () => {
      await listLayoutNames();
    });
  }, [listLayoutNames]);

  return layoutNames;
};

type SaveLayoutFn = (options: {
  layoutName: string;
  layout: Layout;
}) => Promise<void>;

/**
 * Provides a function that when called saves a layout.
 */
export const useSaveLayout = (): SaveLayoutFn => {
  const { publish } = usePubSub();

  const fn = useCallback<SaveLayoutFn>(
    async (options): Promise<void> => {
      const { layoutName, layout } = options;
      await window.api.saveLayout({ layoutName, layout });
      publish('layouts:reload');
    },
    [publish]
  );

  return fn;
};

type DeleteLayoutFn = (layoutName: string) => Promise<void>;

/**
 * Provides a function that when called deletes a layout.
 */
export const useDeleteLayout = (): DeleteLayoutFn => {
  const { publish } = usePubSub();

  const fn = useCallback<DeleteLayoutFn>(
    async (layoutName): Promise<void> => {
      await window.api.deleteLayout({ layoutName });
      publish('layouts:reload');
    },
    [publish]
  );

  return fn;
};
