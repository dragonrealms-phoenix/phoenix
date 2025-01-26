import type { IpcRendererEvent } from 'electron';
import { useEuiTheme } from '@elastic/eui';
import isEmpty from 'lodash-es/isEmpty.js';
import { useObservable } from 'observable-hooks';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as rxjs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { getExperienceMindState } from '../../common/game/game.utils.js';
import type {
  ExperienceGameEvent,
  GameCommandMessage,
  GameEvent,
  RoomGameEvent,
} from '../../common/game/types.js';
import { GameEventType } from '../../common/game/types.js';
import { GameContainer } from '../components/game/game-container.jsx';
import { GameStream } from '../components/game/game-stream.jsx';
import { useSubscribe } from '../hooks/pubsub.jsx';
import { useTheme } from '../hooks/theme.jsx';
import { getGameItemInfo } from '../lib/game/game-item-info.js';
import { GameItemId, type GameLogLine } from '../types/game.types.js';
import type {
  GridItemConfig,
  GridItemContent,
  GridItemInfo,
} from '../types/grid.types.js';

/**
 * Game events will be emitted from the IPC `game:event` channel.
 * This page subscribes and routes them to the correct grid item.
 */
const GamePage: React.FC = (): ReactNode => {
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

  // TODO load the grid config items
  // TODO load the grid layout items

  const { euiTheme } = useEuiTheme();
  const { colorMode } = useTheme();

  const mainStreamId = getGameItemInfo(GameItemId.MAIN).streamId;

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
        gameStreamIdRef.current = '';
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
          streamId: 'experience',
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
            streamId: 'room',
            styles: textStyles,
            text: '__CLEAR_STREAM__',
          });

          gameLogLineSubject$.next({
            eventId: newRoom.eventId,
            streamId: 'room',
            styles: textStyles,
            text: formatRoomText(newRoom),
          });

          return newRoom;
        });
        break;
      case GameEventType.COMPASS:
        // TODO
        break;
      case GameEventType.VITALS:
        // TODO
        break;
      case GameEventType.INDICATOR:
        // TODO
        break;
      case GameEventType.SPELL:
        // TODO
        break;
      case GameEventType.LEFT_HAND:
        // TODO
        break;
      case GameEventType.RIGHT_HAND:
        // TODO
        break;
      case GameEventType.SERVER_TIME:
        // TODO
        break;
      case GameEventType.ROUND_TIME:
        // TODO
        break;
      case GameEventType.CAST_TIME:
        // TODO
        break;
    }
  });

  // When the user sends a command, echo it to the main game stream so that
  // the user sees what they sent and can correlate to the game response.
  useEffect(() => {
    const unsubscribe = window.api.onMessage(
      'game:command',
      (_event: IpcRendererEvent, message: GameCommandMessage) => {
        const { command } = message;
        gameLogLineSubject$.next({
          eventId: uuid(),
          streamId: mainStreamId,
          styles: {
            colorMode,
            subdued: true,
          },
          text: `> ${command}`,
        });
      }
    );
    return () => {
      unsubscribe();
    };
  }, [gameLogLineSubject$, euiTheme, colorMode, mainStreamId]);

  const contentItems = useMemo<Array<GridItemContent>>(() => {
    // TODO define a default config set
    // TODO allow users to customize the set and add/remove items
    // TODO IPC handler to get/save the user's config set
    const configGridItems: Array<GridItemConfig> = [];

    configGridItems.push({
      gameItemInfo: getGameItemInfo(GameItemId.MAIN),
      whenVisibleStreamToItemIds: [GameItemId.MAIN],
      whenHiddenStreamToItemIds: [],
    });

    configGridItems.push({
      gameItemInfo: getGameItemInfo(GameItemId.ROOM),
      whenVisibleStreamToItemIds: [GameItemId.ROOM],
      whenHiddenStreamToItemIds: [],
    });

    configGridItems.push({
      gameItemInfo: getGameItemInfo(GameItemId.EXPERIENCE),
      whenVisibleStreamToItemIds: [GameItemId.EXPERIENCE],
      whenHiddenStreamToItemIds: [],
    });

    configGridItems.push({
      gameItemInfo: getGameItemInfo(GameItemId.SPELLS),
      whenVisibleStreamToItemIds: [GameItemId.SPELLS],
      whenHiddenStreamToItemIds: [],
    });

    configGridItems.push({
      gameItemInfo: getGameItemInfo(GameItemId.ATMOSPHERICS),
      whenVisibleStreamToItemIds: [GameItemId.ATMOSPHERICS],
      whenHiddenStreamToItemIds: [GameItemId.MAIN],
    });

    configGridItems.push({
      gameItemInfo: getGameItemInfo(GameItemId.COMBAT),
      whenVisibleStreamToItemIds: [GameItemId.COMBAT],
      whenHiddenStreamToItemIds: [GameItemId.MAIN],
    });

    configGridItems.push({
      gameItemInfo: getGameItemInfo(GameItemId.ASSESS),
      whenVisibleStreamToItemIds: [GameItemId.ASSESS],
      whenHiddenStreamToItemIds: [GameItemId.COMBAT],
    });

    const configItemsMap: Record<string, GridItemConfig> = {};
    const configItemIds: Array<string> = [];
    configGridItems.forEach((configItem) => {
      const itemId = configItem.gameItemInfo.itemId;
      configItemsMap[itemId] = configItem;
      configItemIds.push(itemId);
    });

    // TODO define a default layout
    // TODO IPC handler to get/save a layout
    // TODO allow user to assign layouts to characters
    let layoutGridItems = new Array<GridItemInfo>();

    layoutGridItems.push({
      itemId: 'room',
      itemTitle: 'Room',
      isFocused: false,
      layout: {
        x: 0,
        y: 0,
        width: 828,
        height: 200,
      },
    });

    layoutGridItems.push({
      itemId: 'experience',
      itemTitle: 'Experience',
      isFocused: false,
      layout: {
        x: 828,
        y: 0,
        width: 306,
        height: 392,
      },
    });

    layoutGridItems.push({
      itemId: 'spells',
      itemTitle: 'Spells',
      isFocused: false,
      layout: {
        x: 828,
        y: 390,
        width: 306,
        height: 355,
      },
    });

    layoutGridItems.push({
      itemId: 'main',
      itemTitle: 'Main',
      isFocused: true,
      layout: {
        x: 0,
        y: 200,
        width: 828,
        height: 545,
      },
    });

    // Drop any items that no longer have a matching config item.
    layoutGridItems = layoutGridItems.filter((layoutItem) => {
      return configItemIds.includes(layoutItem.itemId);
    });

    const layoutItemsMap: Record<string, GridItemInfo> = {};
    const layoutItemIds: Array<string> = [];
    layoutGridItems.forEach((layoutItem) => {
      const itemId = layoutItem.itemId;
      layoutItemsMap[itemId] = layoutItem;
      layoutItemIds.push(itemId);
    });

    // Map of item ids to the item ids that should stream to it.
    // The key is the item id that should receive the stream(s).
    // The values are the items redirecting their stream to the key item.
    const itemStreamMapping: Record<string, Array<string>> = {};

    // If layout includes the config item then stream to its visible items.
    // If layout does not include the config item then stream to its hidden items.
    configGridItems.forEach((configItem) => {
      const itemId = configItem.gameItemInfo.itemId;

      const streamToItemIds = layoutItemsMap[itemId]
        ? configItem.whenVisibleStreamToItemIds
        : configItem.whenHiddenStreamToItemIds;

      // TODO rename this method and move it out the for-each loop
      // If an item is hidden and redirects elsewhere, follow the chain
      // until we find an item that is visible to truly redirect to.
      // This is necessary because the layout may not include all items.
      const funcX = (streamToItemIds: Array<string>, itemId: string) => {
        streamToItemIds.forEach((streamToItemId) => {
          if (layoutItemsMap[streamToItemId]) {
            // We're in luck. We found a visible item to stream to.
            itemStreamMapping[streamToItemId] ||= [];
            itemStreamMapping[streamToItemId].push(itemId);
          } else {
            // Well, where the hidden item wanted to redirect to
            // also is hidden so we need to keep looking for a visible item.
            funcX(
              configItemsMap[streamToItemId].whenHiddenStreamToItemIds,
              itemId
            );
          }
        });
      };

      funcX(streamToItemIds, itemId);
    });

    const contentGridItems: Array<GridItemContent> = [];

    layoutGridItems.forEach((layoutItem) => {
      const configItem = configItemsMap[layoutItem.itemId];

      contentGridItems.push({
        itemId: layoutItem.itemId,
        itemTitle: configItem.gameItemInfo.itemTitle ?? layoutItem.itemTitle,
        isFocused: layoutItem.isFocused,
        layout: layoutItem.layout,
        content: (
          <GameStream
            primaryStreamId={configItem.gameItemInfo.streamId}
            gameStreamIds={itemStreamMapping[layoutItem.itemId].map(
              (itemId) => {
                return configItemsMap[itemId].gameItemInfo.streamId;
              }
            )}
            stream$={gameLogLineSubject$}
          />
        ),
      });
    });

    return contentGridItems;
  }, [gameLogLineSubject$]);

  return <GameContainer contentItems={contentItems} />;
};

// nextjs pages must be default exports
export default GamePage;
