import { css } from '@emotion/react';
import { merge } from 'lodash';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface ScrollableProps {
  /**
   * How to style the scrollable div element.
   */
  style?: CSSProperties;
  /**
   * Class to apply to the scrollable div element.
   */
  className?: string;
  /**
   * Any children to nest within the scrollable div element.
   */
  children?: ReactNode;
}

const defaultStyle = css({
  height: '100%',
  overflowY: 'scroll',
});

/**
 * A component that enables vertical scrolling and will auto-scroll
 * to the bottom as the content grows if the user is already scrolled
 * to the bottom.
 *
 * To stop the auto scrolling, the user simply scrolls up to previous content.
 *
 * The primary driver of this component is for the game stream windows
 * to keep the latest content visible to the user, with the option to
 * scroll up to see previous content.
 *
 * https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react
 */
const Scrollable: React.FC<ScrollableProps> = (
  props: ScrollableProps
): ReactNode => {
  const { children } = props;

  const style = merge({}, defaultStyle, props.style);
  const className = ['eui-yScroll', props.className].join(' ');

  const scrollableRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLSpanElement>(null);

  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);

  useEffect(() => {
    let scrollableElmt = scrollableRef.current;

    const onScroll = () => {
      scrollableElmt = scrollableRef.current;

      if (!scrollableElmt) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollableElmt;
      const difference = scrollHeight - clientHeight - scrollTop;
      const enableAutoScroll = difference <= clientHeight;

      setAutoScrollEnabled(enableAutoScroll);
    };

    scrollableElmt?.addEventListener('scroll', onScroll);

    return () => {
      scrollableElmt?.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (autoScrollEnabled) {
    scrollBottomRef.current?.scrollIntoView({
      behavior: 'instant',
      block: 'end',
      inline: 'nearest',
    });
  }

  return (
    <div ref={scrollableRef} style={style} className={className}>
      {children}
      <span ref={scrollBottomRef} />
    </div>
  );
};

Scrollable.displayName = 'Scrollable';

export { Scrollable };
