import { EuiIcon, EuiToolTip } from '@elastic/eui';
import type React from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { GameEvent } from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { GameContext } from '../../context/game.jsx';
import { useSubscribe } from '../../hooks/pubsub.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';

interface CompassPoint {
  name: string; // 'n', 's', etc
  label: string; // 'North', 'South', etc
  rotation: number;
}

// All possible compass points a room might have.
// The compass point icon points east (-->), so rotations are relative to that.
const compassPoints: Record<string, CompassPoint> = {
  n: { name: 'n', label: 'North', rotation: -90 },
  ne: { name: 'ne', label: 'Northeast', rotation: -45 },
  e: { name: 'e', label: 'East', rotation: 0 },
  se: { name: 'se', label: 'Southeast', rotation: 45 },
  s: { name: 's', label: 'South', rotation: 90 },
  sw: { name: 'sw', label: 'Southwest', rotation: 135 },
  w: { name: 'w', label: 'West', rotation: 180 },
  nw: { name: 'nw', label: 'Northwest', rotation: 225 },
};

export const GameCompass: React.FC = (): ReactNode => {
  const { isConnected } = useContext(GameContext);

  const [hasNorth, setHasNorth] = useState<boolean>(false);
  const [hasNorthEast, setHasNorthEast] = useState<boolean>(false);
  const [hasEast, setHasEast] = useState<boolean>(false);
  const [hasSouthEast, setHasSouthEast] = useState<boolean>(false);
  const [hasSouth, setHasSouth] = useState<boolean>(false);
  const [hasSouthWest, setHasSouthWest] = useState<boolean>(false);
  const [hasWest, setHasWest] = useState<boolean>(false);
  const [hasNorthWest, setHasNorthWest] = useState<boolean>(false);
  const [hasOut, setHasOut] = useState<boolean>(false);

  useEffect(() => {
    if (!isConnected) {
      setHasNorth(false);
      setHasNorthEast(false);
      setHasEast(false);
      setHasSouthEast(false);
      setHasSouth(false);
      setHasSouthWest(false);
      setHasWest(false);
      setHasNorthWest(false);
      setHasOut(false);
    }
  }, [isConnected]);

  // Every time the character changes rooms, the game sends a compass event
  // with the new set of obvious paths the character may move.
  useSubscribe('game:event', (gameEvent: GameEvent) => {
    if (gameEvent.type === GameEventType.COMPASS) {
      const directionSet = new Set(gameEvent.directions);
      setHasNorth(directionSet.has('n'));
      setHasNorthEast(directionSet.has('ne'));
      setHasEast(directionSet.has('e'));
      setHasSouthEast(directionSet.has('se'));
      setHasSouth(directionSet.has('s'));
      setHasSouthWest(directionSet.has('sw'));
      setHasWest(directionSet.has('w'));
      setHasNorthWest(directionSet.has('nw'));
      setHasOut(directionSet.has('out'));
    }
  });

  const buildCompassIcon = useCallback(
    (options: { compassPoint: CompassPoint; enabled: boolean }) => {
      const { compassPoint, enabled } = options;

      let icon: ReactNode;

      if (enabled) {
        icon = (
          <EuiToolTip content={compassPoint.label} position="top">
            <EuiIcon
              type="frameNext"
              color="danger"
              cursor="pointer"
              onClick={() => {
                runInBackground(async () => {
                  await window.api.sendCommand(compassPoint.name);
                });
              }}
            />
          </EuiToolTip>
        );
      } else {
        icon = <EuiIcon type="frameNext" color="subdued" />;
      }

      return (
        <div
          key={compassPoint.name}
          css={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '10px',
            height: '10px',
            transform: `rotate(${compassPoint.rotation}deg) translate(15px) scale(.8)`,
            transformOrigin: 'center',
          }}
        >
          {icon}
        </div>
      );
    },
    []
  );

  const dirNorthIcon = useMemo((): ReactElement => {
    return buildCompassIcon({
      compassPoint: compassPoints.n,
      enabled: hasNorth,
    });
  }, [hasNorth, buildCompassIcon]);

  const dirNorthEastIcon = useMemo((): ReactElement => {
    return buildCompassIcon({
      compassPoint: compassPoints.ne,
      enabled: hasNorthEast,
    });
  }, [hasNorthEast, buildCompassIcon]);

  const dirEastIcon = useMemo((): ReactElement => {
    return buildCompassIcon({
      compassPoint: compassPoints.e,
      enabled: hasEast,
    });
  }, [hasEast, buildCompassIcon]);

  const dirSouthEastIcon = useMemo((): ReactElement => {
    return buildCompassIcon({
      compassPoint: compassPoints.se,
      enabled: hasSouthEast,
    });
  }, [hasSouthEast, buildCompassIcon]);

  const dirSouthIcon = useMemo((): ReactElement => {
    return buildCompassIcon({
      compassPoint: compassPoints.s,
      enabled: hasSouth,
    });
  }, [hasSouth, buildCompassIcon]);

  const dirSouthWestIcon = useMemo((): ReactElement => {
    return buildCompassIcon({
      compassPoint: compassPoints.sw,
      enabled: hasSouthWest,
    });
  }, [hasSouthWest, buildCompassIcon]);

  const dirWestIcon = useMemo((): ReactElement => {
    return buildCompassIcon({
      compassPoint: compassPoints.w,
      enabled: hasWest,
    });
  }, [hasWest, buildCompassIcon]);

  const dirNorthWestIcon = useMemo((): ReactElement => {
    return buildCompassIcon({
      compassPoint: compassPoints.nw,
      enabled: hasNorthWest,
    });
  }, [hasNorthWest, buildCompassIcon]);

  const dirOutIcon = useMemo((): ReactElement => {
    let icon: ReactNode;

    if (hasOut) {
      icon = (
        <EuiToolTip content="Out" position="top">
          <EuiIcon
            type="dot"
            color="danger"
            cursor="pointer"
            onClick={() => {
              runInBackground(async () => {
                await window.api.sendCommand('out');
              });
            }}
          />
        </EuiToolTip>
      );
    } else {
      icon = <EuiIcon type="dot" color="subdued" />;
    }

    return (
      <div
        css={{
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '12px',
          height: '12px',
        }}
      >
        {icon}
      </div>
    );
  }, [hasOut]);

  const compassIcons = useMemo((): ReactElement => {
    return (
      <div
        css={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '50px',
          height: '50px',
        }}
      >
        {dirNorthIcon}
        {dirNorthEastIcon}
        {dirEastIcon}
        {dirSouthEastIcon}
        {dirSouthIcon}
        {dirSouthWestIcon}
        {dirWestIcon}
        {dirNorthWestIcon}
        {dirOutIcon}
      </div>
    );
  }, [
    dirNorthIcon,
    dirNorthEastIcon,
    dirEastIcon,
    dirSouthEastIcon,
    dirSouthIcon,
    dirSouthWestIcon,
    dirWestIcon,
    dirNorthWestIcon,
    dirOutIcon,
  ]);

  return compassIcons;
};

GameCompass.displayName = 'GameCompass';
