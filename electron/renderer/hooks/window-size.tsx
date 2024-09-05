// Inspired by stackoverflow solution.
// https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs

import debounce from 'lodash-es/debounce.js';
import { useEffect, useState } from 'react';

export interface UseWindowSizeProps {
  /**
   * The number of milliseconds to wait before updating the window size.
   * When the user is actively resizing the window, the 'resize' event
   * fires rapidly. For performance, debounce so we react more efficiently.
   *
   * Default is 100.
   */
  delay?: number;
}

export interface WindowSize {
  height: number;
  width: number;
}

const defaultSize: WindowSize = {
  height: 0,
  width: 0,
};

/**
 * Usage:
 * ```
 * const { height, width } = useWindowSize();
 * ```
 */
export const useWindowSize = (props?: UseWindowSizeProps): WindowSize => {
  const { delay = 100 } = props ?? {};

  const [size, setSize] = useState<WindowSize>(defaultSize);

  useEffect(() => {
    const onWindowResize = debounce(() => {
      setSize({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }, delay);

    onWindowResize(); // capture initial size

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, [delay]);

  return size;
};
