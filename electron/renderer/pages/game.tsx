import isEmpty from 'lodash-es/isEmpty.js';
import { useObservable } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { getExperienceMindState } from '../../common/game/game.utils.js';
import type {
  ExperienceGameEvent,
  GameEvent,
  RoomGameEvent,
} from '../../common/game/types.js';
import { GameEventType } from '../../common/game/types.js';
import { GameContainer } from '../components/game/game-container.jsx';
import { GameStream } from '../components/game/game-stream.jsx';
import { useGetLayout } from '../hooks/layouts.jsx';
import { useLogger } from '../hooks/logger.jsx';
import { useSubscribe } from '../hooks/pubsub.jsx';
import { useTheme } from '../hooks/theme.jsx';
import type { GameLogLine } from '../types/game.types.js';
import type {
  GridItemConfig,
  GridItemContent,
  GridItemInfo,
} from '../types/grid.types.js';

const GamePage: React.FC = (): ReactNode => {
  const logger = useLogger('renderer:page:game');

  const mainStreamId = 'main';
  const roomStreamId = 'room';
  const experienceStreamId = 'experience';

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

  const { colorMode } = useTheme();

  // TODO refactor to a ExperienceGameStream component
  //      it will know all skills to render and can highlight
  //      ones that pulse, toggle between mind state and mind state rate, etc
  const formatExperienceText = useCallback(
    (gameEvent: ExperienceGameEvent): string => {
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
    },
    []
  );

  // TODO refactor to a RoomGameStream component
  //      so that it subscribes to all the room events
  //      and updates and formats the text as needed
  //      This would allow the room name to be formatted
  const formatRoomText = useCallback((gameEvent: RoomGameEvent): string => {
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
  }, []);

  const [_roomGameEvent, setRoomGameEvent] = useState<RoomGameEvent>({
    type: GameEventType.ROOM,
    eventId: uuid(),
  });

  // Track high level game events such as stream ids and formatting.
  // Re-emit text events to the game stream subject to get to grid items.
  useSubscribe(['game:event'], (gameEvent: GameEvent) => {
    const textStyles: GameLogLine['styles'] = {
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
          styles: textStyles,
          text: '__CLEAR_STREAM__',
        });
        break;

      case GameEventType.PUSH_STREAM:
        gameStreamIdRef.current = gameEvent.streamId;
        break;

      case GameEventType.POP_STREAM:
        gameStreamIdRef.current = mainStreamId;
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
          styles: textStyles,
          text: gameEvent.text,
        });
        break;

      case GameEventType.EXPERIENCE:
        // TODO need to track a map of skill names to their latest event
        //      so that when we receive a new event we can update that skill
        //      then clear the exp stream and render all skills again
        gameLogLineSubject$.next({
          eventId: gameEvent.eventId,
          streamId: experienceStreamId,
          styles: {
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
            streamId: roomStreamId,
            styles: textStyles,
            text: '__CLEAR_STREAM__',
          });

          gameLogLineSubject$.next({
            eventId: newRoom.eventId,
            streamId: roomStreamId,
            styles: textStyles,
            text: formatRoomText(newRoom),
          });

          return newRoom;
        });
        break;
    }
  });

  // When the user sends a command, echo it to the main game stream so that
  // the user sees what they sent and can correlate to the game response.
  useSubscribe(['game:command'], (command: string) => {
    gameLogLineSubject$.next({
      eventId: uuid(),
      streamId: mainStreamId,
      styles: {
        colorMode,
        subdued: true,
      },
      text: `> ${command}`,
    });
  });

  // One of the ways to let user know the game has disconnected.
  useSubscribe(['game:disconnect'], () => {
    gameLogLineSubject$.next({
      eventId: uuid(),
      streamId: mainStreamId,
      styles: {
        colorMode,
        subdued: true,
      },
      text: `> GAME DISCONNECTED`,
    });
  });

  // TODO menu to let user select which layout to use
  // TODO when layout is loaded, reposition/resize the app window (via ipc)
  const layoutName = 'default';
  const layout = useGetLayout(layoutName);

  const contentItems = useMemo<Array<GridItemContent>>(() => {
    if (!layout) {
      logger.error('no layout found', { layoutName });
      return [];
    }

    // TODO create function to create grid item configs from layout
    const configItems: Array<GridItemConfig> = [];
    layout.items.forEach((streamLayout) => {
      const configItem: GridItemConfig = {
        itemId: streamLayout.id,
        itemTitle: streamLayout.title,
        isVisible: streamLayout.visible,
        layout: {
          x: streamLayout.x,
          y: streamLayout.y,
          width: streamLayout.width,
          height: streamLayout.height,
        },
        whenHiddenRedirectToItemId: streamLayout.whenHiddenRedirectToId,
      };
      configItems.push(configItem);
    });

    const configItemsMap: Record<string, GridItemConfig> = {};
    configItems.forEach((configItem) => {
      const itemId = configItem.itemId;
      configItemsMap[itemId] = configItem;
    });

    const layoutItems = new Array<GridItemInfo>();
    configItems.forEach((configItem) => {
      if (configItem.isVisible) {
        const layoutItem: GridItemInfo = {
          itemId: configItem.itemId,
          itemTitle: configItem.itemTitle,
          isFocused: configItem.itemId === mainStreamId,
          layout: configItem.layout,
        };
        layoutItems.push(layoutItem);
      }
    });

    const layoutItemsMap: Record<string, GridItemInfo> = {};
    layoutItems.forEach((layoutItem) => {
      const itemId = layoutItem.itemId;
      layoutItemsMap[itemId] = layoutItem;
    });

    // Map of item ids to the item ids that should stream to it.
    // The key is the item id that should receive the stream(s).
    // The values are the items redirecting their stream to the key item.
    const itemStreamMapping: Record<string, Array<string>> = {};

    // If layout includes the config item then stream to its visible items.
    // If layout does not include the config item then stream to its hidden items.
    configItems.forEach((configItem) => {
      const itemId = configItem.itemId;

      const streamToItemId = configItem.isVisible
        ? configItem.itemId
        : configItem.whenHiddenRedirectToItemId;

      if (!streamToItemId) {
        return;
      }

      // TODO rename this method and move it out the for-each loop
      // If an item is hidden and redirects elsewhere, follow the chain
      // until we find an item that is visible to truly redirect to.
      // This is necessary because the layout may not include all items.
      const funcX = (streamToItemId: string, itemId: string) => {
        const streamToConfigItem = configItemsMap[streamToItemId];
        if (!streamToConfigItem) {
          return;
        }
        if (streamToConfigItem.isVisible) {
          // We're in luck. We found a visible item to stream to.
          itemStreamMapping[streamToItemId] ||= [];
          itemStreamMapping[streamToItemId].push(itemId);
        } else if (streamToConfigItem.whenHiddenRedirectToItemId) {
          // Well, where the hidden item wanted to redirect to
          // also is hidden so we need to keep looking for a visible item.
          funcX(streamToConfigItem.whenHiddenRedirectToItemId, itemId);
        }
      };

      funcX(streamToItemId, itemId);
    });

    const contentGridItems: Array<GridItemContent> = [];

    layoutItems.forEach((layoutItem) => {
      contentGridItems.push({
        itemId: layoutItem.itemId,
        itemTitle: layoutItem.itemTitle,
        isFocused: layoutItem.isFocused,
        layout: layoutItem.layout,
        content: (
          <GameStream
            primaryStreamId={layoutItem.itemId}
            gameStreamIds={itemStreamMapping[layoutItem.itemId]}
            stream$={gameLogLineSubject$}
          />
        ),
      });
    });

    return contentGridItems;
  }, [gameLogLineSubject$, layout, logger]);

  return <GameContainer contentItems={contentItems} />;
};

// nextjs pages must be default exports
export default GamePage;
