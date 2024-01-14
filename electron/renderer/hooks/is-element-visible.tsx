import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseIsElementVisibleOptions {
  /**
   * Where to attach the observer.
   * The target must be a child of this element.
   */
  root: Element | null;
  /**
   * The element to track its visibility.
   * The target must be a child of the root element.
   */
  target: Element | null;
  /**
   * Either a single number or an array of numbers which indicate
   * at what percentage of the target's visibility the observer's
   * callback should be executed.
   *
   * The values must be in the range of 0.0 and 1.0.
   *
   * Default is 1.0
   */
  threshold?: number | Array<number>;
}

export type UseIsElementVisibleResult = [isVisible: boolean];

/**
 * Hook that implements the Intersection Observer API.
 * https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 */
export function useIsElementVisible(
  options: UseIsElementVisibleOptions
): UseIsElementVisibleResult {
  const { root, target, threshold = 1 } = options;

  const [isVisible, setIsVisible] = useState(false);

  const onObserveCallback = useCallback<IntersectionObserverCallback>(
    (entries: Array<IntersectionObserverEntry>) => {
      // This hook only observes one target, so we can safely assume
      // that the first entry is the one we care about.
      const [entry] = entries;
      setIsVisible(entry.isIntersecting);
    },
    []
  );

  const observer = useMemo<IntersectionObserver>(() => {
    const observer = new IntersectionObserver(onObserveCallback, {
      root,
      threshold,
    });

    return observer;
  }, [root, threshold, onObserveCallback]);

  // For some reason, if we have a dependency array then
  // the observations stop working. Seems excessive, but
  // the only way I got this to work is to run on each render.
  useEffect(() => {
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  });

  return [isVisible];
}
