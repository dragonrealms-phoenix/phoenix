// https://stackoverflow.com/questions/36862334/get-viewport-window-height-in-reactjs

import { debounce } from 'lodash';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const onWindowResize = debounce(() => {
      setDimensions(getWindowDimensions());
    }, 100);

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  return dimensions;
};
