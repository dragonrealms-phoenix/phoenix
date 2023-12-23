// https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs

import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

export interface WindowDimensions {
  height?: number;
  width?: number;
}

const getWindowDimensions = (): WindowDimensions => {
  if (typeof window === 'undefined') {
    return {};
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const useWindowDimensions = (): WindowDimensions => {
  const [dimensions, setDimensions] = useState<WindowDimensions>(
    getWindowDimensions()
  );

  const onWindowResize = useCallback(
    debounce(() => {
      setDimensions(getWindowDimensions());
    }, 100),
    []
  );

  useEffect(() => {
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return dimensions;
};
