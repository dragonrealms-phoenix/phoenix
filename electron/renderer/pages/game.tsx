import isEmpty from 'lodash-es/isEmpty.js';
import { useObservable } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { getExperienceMindState } from '../../common/game/game.utils.js';
import type {
  ExperienceGameEvent,
  GameEvent,
  RoomGameEvent,
} from '../../common/game/types.js';
import { GameEventType } from '../../common/game/types.js';
import type { Layout } from '../../common/layout/types.js';
import { GameContainer } from '../components/game/game-container.jsx';
import { GameStream } from '../components/game/game-stream.jsx';
import { useLoadedLayout, useSaveLayout } from '../hooks/layouts.jsx';
import { useLogger } from '../hooks/logger.jsx';
import { useSubscribe } from '../hooks/pubsub.jsx';
import { useTheme } from '../hooks/theme.jsx';
import type { GameLogLine } from '../types/game.types.js';
import type {
  GridItemConfig,
  GridItemContent,
  GridItemInfo,
} from '../types/grid.types.js';
import type { PubSubEvent } from '../types/pubsub.types.js';

const GamePage: React.FC = (): ReactNode => {
  const { colorMode } = useTheme();

  const logger = useLogger('renderer:page:game');

  const { layoutName, layout } = useLoadedLayout();
  const saveLayout = useSaveLayout();

  // I started tracking these via `useState` but when calling their setter
  // the value did not update fast enough before a text game event
  // was received, resulting in text routing to the wrong stream window
  // or not formatting correctly. So I moved them to refs instead.
  const gameStreamIdRef = useRef<string>('');
  const textOutputClassRef = useRef<string>('');
  const textStylePresetRef = useRef<string>('');
  const textStyleBoldRef = useRef<boolean>(false);

  // Content destined for a specific game stream window (aka grid item).
  // These include any applicable styling and formatting.
  // Example stream ids include 'room', 'experience', 'combat', etc.
  const gameLogLineSubject$ = useObservable(() => {
    return new rxjs.Subject<GameLogLine>();
  });

  const [_roomGameEvent, setRoomGameEvent] = useState<RoomGameEvent>({
    type: GameEventType.ROOM,
    eventId: uuid(),
  });

  // Track high level game events such as stream ids and formatting.
  // Re-emit text events to the game stream subject to get to grid items.
  useSubscribe('game:event', (gameEvent: GameEvent) => {
    const textStyles: GameLogLine['style'] = {
      colorMode,
      outputClass: textOutputClassRef.current,
      stylePreset: textStylePresetRef.current,
      bold: textStyleBoldRef.current,
    };

    switch (gameEvent.type) {
      case GameEventType.CLEAR_STREAM:
        gameLogLineSubject$.next({
          eventId: gameEvent.eventId,
          streamId: gameEvent.streamId,
          style: textStyles,
          text: '__CLEAR_STREAM__',
        });
        break;

      case GameEventType.PUSH_STREAM:
        gameStreamIdRef.current = gameEvent.streamId;
        break;

      case GameEventType.POP_STREAM:
        gameStreamIdRef.current = 'main';
        break;

      case GameEventType.PUSH_BOLD:
        textStyleBoldRef.current = true;
        break;

      case GameEventType.POP_BOLD:
        textStyleBoldRef.current = false;
        break;

      case GameEventType.TEXT_OUTPUT_CLASS:
        textOutputClassRef.current = gameEvent.textOutputClass;
        break;

      case GameEventType.TEXT_STYLE_PRESET:
        textStylePresetRef.current = gameEvent.textStylePreset;
        break;

      case GameEventType.TEXT:
        gameLogLineSubject$.next({
          eventId: gameEvent.eventId,
          streamId: gameStreamIdRef.current,
          style: textStyles,
          text: gameEvent.text,
        });
        break;

      case GameEventType.EXPERIENCE:
        // TODO need to track a map of skill names to their latest event
        //      so that when we receive a new event we can update that skill
        //      then clear the exp stream and render all skills again
        gameLogLineSubject$.next({
          eventId: gameEvent.eventId,
          streamId: 'experience',
          style: {
            ...textStyles,
            outputClass: 'mono',
          },
          text: formatExperienceText(gameEvent),
        });
        break;

      case GameEventType.ROOM:
        setRoomGameEvent((oldRoom: RoomGameEvent) => {
          let newRoom: RoomGameEvent;

          // Each room game event only contains the field that has changed.
          // If this is a new room then clear the other fields.
          // Otherwise merge the new fields into the existing room.
          if (gameEvent.roomName) {
            newRoom = gameEvent;
          } else {
            newRoom = {
              ...oldRoom,
              ...gameEvent,
            };
          }

          // The room stream is special in that it only displays
          // the text for the current room, not a history of rooms.
          // Therefore, we clear the stream before displaying the new room.
          gameLogLineSubject$.next({
            eventId: oldRoom.eventId,
            streamId: 'room',
            style: textStyles,
            text: '__CLEAR_STREAM__',
          });

          gameLogLineSubject$.next({
            eventId: newRoom.eventId,
            streamId: 'room',
            style: textStyles,
            text: formatRoomText(newRoom),
          });

          return newRoom;
        });
        break;
    }
  });

  // When the user sends a command, echo it to the main game stream so that
  // the user sees what they sent and can correlate to the game response.
  useSubscribe('game:command', (command: string) => {
    gameLogLineSubject$.next({
      eventId: uuid(),
      streamId: 'main',
      style: {
        colorMode,
        subdued: true,
      },
      text: `> ${command}`,
    });
  });

  // One of the ways to let user know the game has disconnected.
  useSubscribe('game:disconnect', () => {
    gameLogLineSubject$.next({
      eventId: uuid(),
      streamId: 'main',
      style: {
        colorMode,
        subdued: true,
      },
      text: `> GAME DISCONNECTED`,
    });
  });

  // Save layout when item is closed.
  useSubscribe(
    'layout:item:closed',
    async (event: PubSubEvent.LayoutItemClosed) => {
      const { itemId } = event;

      logger.debug('layout item closed, saving layout', event);

      if (layout?.items) {
        const streamLayout = layout.items.find((streamLayout) => {
          return streamLayout.id === itemId;
        });

        if (streamLayout) {
          streamLayout.visible = false;
        }

        await saveLayout({
          layoutName,
          layout,
        });
      }
    }
  );

  // Save layout when item is moved or resized.
  useSubscribe(
    'layout:item:moved',
    async (event: PubSubEvent.LayoutItemMoved) => {
      const { itemId, x, y, width, height } = event;

      logger.debug('layout item moved, saving layout', event);

      if (layout?.items) {
        const streamLayout = layout.items.find((streamLayout) => {
          return streamLayout.id === itemId;
        });

        if (streamLayout) {
          streamLayout.x = x;
          streamLayout.y = y;
          streamLayout.width = width;
          streamLayout.height = height;
        }

        await saveLayout({
          layoutName,
          layout,
        });
      }
    }
  );

  const contentItems = useMemo<Array<GridItemContent>>(() => {
    if (!layout) {
      // On initial render, the layout won't be loaded yet, skip
      return [];
    }

    const configItemsMap = buildConfigGridItemsMap(layout);
    const configItems = Object.values(configItemsMap);

    const layoutItemsMap = buildLayoutGridItemsMap(configItems);
    const layoutItems = Object.values(layoutItemsMap);

    const streamItemsMap = buildGridItemStreamsMap(configItemsMap);

    const contentGridItems: Array<GridItemContent> = [];

    layoutItems.forEach((layoutItem) => {
      contentGridItems.push({
        itemId: layoutItem.itemId,
        itemTitle: layoutItem.itemTitle,
        isFocused: layoutItem.isFocused,
        position: layoutItem.position,
        style: layoutItem.style,
        content: (
          <GameStream
            stream$={gameLogLineSubject$}
            primaryStreamId={layoutItem.itemId}
            gameStreamIds={streamItemsMap[layoutItem.itemId]}
            style={layoutItem.style}
          />
        ),
      });
    });

    return contentGridItems;
  }, [gameLogLineSubject$, layout]);

  const gameContainer = useMemo(() => {
    return <GameContainer contentItems={contentItems} />;
  }, [contentItems]);

  return gameContainer;
};

// nextjs pages must be default exports
export default GamePage;

/**
 * The keys are the item ids.
 * The values are the grid item config.
 */
const buildConfigGridItemsMap = (
  layout: Layout
): Record<string, GridItemConfig> => {
  const configItemsMap: Record<string, GridItemConfig> = {};

  layout.items.forEach((streamLayout) => {
    const configItem: GridItemConfig = {
      itemId: streamLayout.id,
      itemTitle: streamLayout.title,
      isVisible: streamLayout.visible,
      position: {
        x: streamLayout.x,
        y: streamLayout.y,
        width: streamLayout.width,
        height: streamLayout.height,
      },
      style: {
        fontFamily: streamLayout.fontFamily,
        fontSize: streamLayout.fontSize,
        foregroundColor: streamLayout.foregroundColor,
        backgroundColor: streamLayout.backgroundColor,
      },
      whenHiddenRedirectToItemId: streamLayout.whenHiddenRedirectToId,
    };
    configItemsMap[configItem.itemId] = configItem;
  });

  return configItemsMap;
};

/**
 * Returns a map of infos for visible grid items.
 */
const buildLayoutGridItemsMap = (
  configItems: Array<GridItemConfig>
): Record<string, GridItemInfo> => {
  const layoutItemsMap: Record<string, GridItemInfo> = {};

  configItems.forEach((configItem) => {
    if (configItem.isVisible) {
      const layoutItem: GridItemInfo = {
        itemId: configItem.itemId,
        itemTitle: configItem.itemTitle,
        isFocused: configItem.itemId === 'main',
        position: configItem.position,
        style: configItem.style,
      };
      layoutItemsMap[layoutItem.itemId] = layoutItem;
    }
  });

  return layoutItemsMap;
};

/**
 * Builds an array of item ids and which other items are redirecting to it.
 * This is how we let other streams redirect to other streams.
 * For example, if the 'combat' stream is hidden then 'assess' can
 * redirect to the 'main' stream rather than not being seen at all.
 */
const buildGridItemStreamsMap = (
  configItemsMap: Record<string, GridItemConfig>
): Record<string, Array<string>> => {
  // Map of item ids to the item ids that should stream to it.
  // The key is the item id that should receive the stream(s).
  // The values are the items redirecting their stream to the key item.
  const itemStreamMapping: Record<string, Array<string>> = {};

  // If an item is hidden and redirects elsewhere, follow the chain
  // until we find an item that is visible to truly redirect to.
  // This is necessary because the layout may not include all items.
  const redirectItemToVisibleStream = (options: {
    /**
     * The item to map to a visible stream, if one can be found.
     */
    itemId: string;
    /**
     * Where the item wants to redirect to.
     * It may be itself or another stream.
     * If this item is hidden, we recursively check if
     * it redirects to a visible stream and use that instead.
     */
    redirectToItemId: string;
  }): void => {
    const { itemId, redirectToItemId } = options;

    const configItem = configItemsMap[redirectToItemId];

    if (!configItem) {
      return;
    }

    if (configItem.isVisible) {
      // We're in luck. We found a visible item to stream to.
      itemStreamMapping[redirectToItemId] ||= [];
      itemStreamMapping[redirectToItemId].push(itemId);
    } else if (configItem.whenHiddenRedirectToItemId) {
      // Well, where the hidden item wanted to redirect to
      // also is hidden so we need to keep looking for a visible item.
      redirectItemToVisibleStream({
        itemId,
        redirectToItemId: configItem.whenHiddenRedirectToItemId,
      });
    }
  };

  const configItems = Object.values(configItemsMap);

  configItems.forEach((configItem) => {
    const streamToItemId = configItem.isVisible
      ? configItem.itemId
      : configItem.whenHiddenRedirectToItemId;

    if (!streamToItemId) {
      return;
    }

    redirectItemToVisibleStream({
      itemId: configItem.itemId,
      redirectToItemId: streamToItemId,
    });
  });

  return itemStreamMapping;
};

// TODO refactor to a ExperienceGameStream component
//      it will know all skills to render and can highlight
//      ones that pulse, toggle between mind state and mind state rate, etc
const formatExperienceText = (gameEvent: ExperienceGameEvent): string => {
  const { skill, rank, percent, mindState } = gameEvent;
  const mindStateRate = getExperienceMindState(mindState) ?? 0;

  const txtSkill = skill.padStart(15);
  const txtRank = String(rank).padStart(3);
  const txtPercent = String(percent).padStart(2) + '%';

  // TODO add user pref to toggle between mind state rate and mind state
  const txtMindStateRate = `(${mindStateRate}/34)`.padStart(7);
  // const txtMindState = mindState.padEnd(15);

  return [
    txtSkill,
    txtRank,
    txtPercent,
    txtMindStateRate,
    // txtMindState,
  ].join(' ');
};

// TODO refactor to a RoomGameStream component
//      so that it subscribes to all the room events
//      and updates and formats the text as needed
//      This would allow the room name to be formatted
const formatRoomText = (gameEvent: RoomGameEvent): string => {
  const { roomName, roomDescription } = gameEvent;
  const { roomObjects, roomPlayers, roomExits } = gameEvent;

  const text = [
    roomName,
    [roomDescription, roomObjects].join('  '), // two spaces between sentences
    roomPlayers,
    roomExits,
  ]
    .filter((s) => !isEmpty(s?.trim()))
    .join('\n');

  return text;
};
