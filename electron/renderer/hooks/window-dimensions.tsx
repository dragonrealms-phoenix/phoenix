// https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs

import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

export interface WindowDimensions {
  height?: number;
  width?: number;
}

function getWindowDimensions(): WindowDimensions {
  if (typeof window === 'undefined') {
    return {};
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * To use this hook, the `window` object must be defined
 * and emit the `resize` event.
 */
export function useWindowDimensions(): WindowDimensions {
  const [dimensions, setDimensions] = useState<WindowDimensions>(
    getWindowDimensions()
  );

  const onWindowResize = useMemo(() => {
    // When resizing a window, this event fires rapidly.
    // For performance, debounce so we react more efficiently.
    return debounce(() => {
      setDimensions(getWindowDimensions());
    }, 100);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, [onWindowResize]);

  return dimensions;
}
