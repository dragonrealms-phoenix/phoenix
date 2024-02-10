// Inspired by `useMeasure` by @streamich/react-use.
// https://github.com/streamich/react-use/blob/master/src/useMeasure.ts
// https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver

import debounce from 'lodash-es/debounce.js';
import { useEffect, useMemo, useState } from 'react';

export interface UseMeasureProps {
  /**
   * The number of milliseconds to wait before updating the measured size.
   * When the user is actively resizing the window, the 'resize' event
   * fires rapidly. For performance, debounce so we react more efficiently.
   *
   * Default is 100.
   */
  delay?: number;
}

export type UseMeasureRef<E extends Element = Element> = (element: E) => void;

export type UseMeasureResult<E extends Element = Element> = [
  UseMeasureRef<E>,
  ElementSize,
];

export interface ElementSize {
  height: number;
  width: number;
}

const defaultSize: ElementSize = {
  height: 0,
  width: 0,
};

/**
 * Usage:
 * ```
 * const [ref, { height, width }] = useMeasure();
 * ...
 * <div ref={ref}></div>
 * ```
 */
export function useMeasure<E extends Element = Element>(
  props?: UseMeasureProps
): UseMeasureResult<E> {
  const { delay = 100 } = props ?? {};

  const [element, ref] = useState<E | null>(null);
  const [size, setSize] = useState<ElementSize>(defaultSize);

  const observer = useMemo(() => {
    const onResize = debounce<ResizeObserverCallback>((entries) => {
      // We are observing at most one element,
      // but the API supports observing multiple elements.
      // Grab the first one.
      if (entries[0]) {
        const height = entries[0].contentRect.height;
        const width = entries[0].contentRect.width;
        setSize({ height, width });
      }
    }, delay);

    return new ResizeObserver(onResize);
  }, [delay]);

  useEffect(() => {
    if (!element) {
      return;
    }
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [observer, element]);

  return [ref, size];
}
