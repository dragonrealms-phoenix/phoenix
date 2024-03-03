import debounce from 'lodash-es/debounce.js';
import type { DragEvent, DragEventHandler, ReactNode } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useLogger } from '../../hooks/logger.jsx';

export interface Grid2Props {
  /**
   * The dimension for the grid.
   */
  dimensions: {
    /**
     * The max height of the grid in pixels.
     */
    height: number;
    /**
     * The max width of the grid in pixels.
     */
    width: number;
  };
}

export const Grid2: React.FC<Grid2Props> = (props: Grid2Props): ReactNode => {
  const { dimensions } = props;

  const logger = useLogger('page:grid2');

  const { height, width } = dimensions;

  // TODO although this code works, I'm struggling to reposition the element
  //      exactly where the user drops it. Some rudimentary calculations always
  //      cause the element to either (a) snap to the top-left of the mouse, or
  //      (b) center it around the mouse.
  //
  //      I think I may need to introduce mouse events to know exactly
  //      how many pixels (dx, dy) the user has moved the element from
  //      its original position.
  //      Update: See `grid3.tsx` that ChatGPT created.

  const onDragStart: DragEventHandler<HTMLDivElement> = useCallback(
    (event: DragEvent) => {
      logger.info('onDragStart', {
        type: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
        dataTransfer: event.dataTransfer,
      });
    },
    [logger]
  );

  const debouncedOnDragStart = useMemo(() => {
    return debounce(onDragStart, 250, {
      leading: true,
      trailing: false,
      maxWait: 250,
    });
  }, [onDragStart]);

  const onDragEnd: DragEventHandler<HTMLDivElement> = useCallback(
    (event: DragEvent) => {
      logger.info('onDragEnd', {
        type: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
        dataTransfer: event.dataTransfer,
      });
    },
    [logger]
  );

  const debouncedOnDragEnd = useMemo(() => {
    return debounce(onDragEnd, 250, {
      leading: true,
      trailing: false,
      maxWait: 250,
    });
  }, [onDragEnd]);

  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
    (event: DragEvent) => {
      logger.info('onDrop', {
        type: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
        dataTransfer: event.dataTransfer,
      });
    },
    [logger]
  );

  const debouncedOnDrop = useMemo(() => {
    return debounce(onDrop, 250, {
      leading: true,
      trailing: false,
      maxWait: 250,
    });
  }, [onDrop]);

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback(
    (event: DragEvent) => {
      logger.info('onDragOver', {
        type: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
        dataTransfer: event.dataTransfer,
      });
    },
    [logger]
  );

  const debouncedOnDragOver = useMemo(() => {
    return debounce(onDragOver, 250, {
      leading: true,
      trailing: false,
      maxWait: 250,
    });
  }, [onDragOver]);

  const onDragEnter: DragEventHandler<HTMLDivElement> = useCallback(
    (event: DragEvent) => {
      logger.info('onDragEnter', {
        type: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
        dataTransfer: event.dataTransfer,
      });
    },
    [logger]
  );

  const debouncedOnDragEnter = useMemo(() => {
    return debounce(onDragEnter, 250, {
      leading: true,
      trailing: false,
      maxWait: 250,
    });
  }, [onDragEnter]);

  const onDragLeave: DragEventHandler<HTMLDivElement> = useCallback(
    (event: DragEvent) => {
      logger.info('onDragLeave', {
        type: event.type,
        clientX: event.clientX,
        clientY: event.clientY,
        dataTransfer: event.dataTransfer,
      });
    },
    [logger]
  );

  const debouncedOnDragLeave = useMemo(() => {
    return debounce(onDragLeave, 250, {
      leading: true,
      trailing: false,
      maxWait: 250,
    });
  }, [onDragLeave]);

  // Cancel all queued debounced functions when the component is unmounted.
  useEffect(() => {
    return () => {
      debouncedOnDragStart.cancel();
      debouncedOnDragEnd.cancel();
      debouncedOnDrop.cancel();
      debouncedOnDragOver.cancel();
      debouncedOnDragEnter.cancel();
      debouncedOnDragLeave.cancel();
    };
  }, [
    debouncedOnDragStart,
    debouncedOnDragEnd,
    debouncedOnDrop,
    debouncedOnDragOver,
    debouncedOnDragEnter,
    debouncedOnDragLeave,
  ]);

  return (
    <>
      <div
        id="source"
        draggable="true"
        onDragStart={(event) => {
          debouncedOnDragStart(event);
        }}
        onDragEnd={(event) => {
          debouncedOnDragEnd(event);
        }}
        style={{
          border: '5px solid green',
          height: 30,
          width: 80,
          textAlign: 'center',
        }}
      >
        <strong>Element</strong>
      </div>

      <div
        id="destination"
        onDrop={(event) => {
          debouncedOnDrop(event);
        }}
        onDragOver={(event) => {
          // To enable 'drop' events, we must prevent the default drag over behavior.
          // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#droptargets
          event.preventDefault();
          debouncedOnDragOver(event);
        }}
        onDragEnter={(event) => {
          // To enable 'drop' events, we must prevent the default drag enter behavior.
          // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#droptargets
          event.preventDefault();
          debouncedOnDragEnter(event);
        }}
        onDragLeave={(event) => {
          debouncedOnDragLeave(event);
        }}
        style={{
          border: '5px solid pink',
          height,
          width,
          textAlign: 'center',
        }}
      >
        <strong>Drop Zone</strong>
      </div>
    </>
  );
};

Grid2.displayName = 'Grid2';
