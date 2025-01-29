import { EuiIcon } from '@elastic/eui';
import { css } from '@emotion/react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { GameEvent } from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { useSubscribe } from '../../hooks/pubsub.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';

const compassStyle = css({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '50px',
  height: '50px',
});

const centerStyle = css({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '12px',
  height: '12px',
});

const compassPointStyle = (compassPoint: CompassPoint) => {
  const { rotation } = compassPoint;
  return css({
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '10px',
    height: '10px',
    transform: `rotate(${rotation}deg) translate(15px) scale(.8)`,
    transformOrigin: 'center',
  });
};

interface CompassPoint {
  name: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
  rotation: number;
}

// All possible compass points a room might have.
// The compass point icon points east (-->), so rotations are relative to that.
const compassPoints: Array<CompassPoint> = [
  { name: 'n', rotation: -90 },
  { name: 'ne', rotation: -45 },
  { name: 'e', rotation: 0 },
  { name: 'se', rotation: 45 },
  { name: 's', rotation: 90 },
  { name: 'sw', rotation: 135 },
  { name: 'w', rotation: 180 },
  { name: 'nw', rotation: 225 },
];

export const GameCompass: React.FC = () => {
  const [obviousPaths, setObviousPaths] = useState<Array<string>>([]);

  // Every time the character changes rooms, the game sends a compass event
  // with the new set of obvious paths the character may move.
  useSubscribe(['game:event'], (gameEvent: GameEvent) => {
    if (gameEvent.type === GameEventType.COMPASS) {
      setObviousPaths(gameEvent.directions);
    }
  });

  const centerIcon = useMemo(() => {
    if (obviousPaths.includes('out')) {
      return (
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
      );
    }
    return <EuiIcon type="dot" color="subdued" />;
  }, [obviousPaths]);

  const compassIcons = useMemo(() => {
    return compassPoints.map((compassPoint) => {
      if (obviousPaths.includes(compassPoint.name)) {
        return (
          <div key={compassPoint.name} css={compassPointStyle(compassPoint)}>
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
          </div>
        );
      }
      return (
        <div key={compassPoint.name} css={compassPointStyle(compassPoint)}>
          <EuiIcon type="frameNext" color="subdued" />
        </div>
      );
    });
  }, [obviousPaths]);

  return (
    <div css={compassStyle}>
      {compassIcons}
      <div css={centerStyle}>{centerIcon}</div>
    </div>
  );
};

GameCompass.displayName = 'GameCompass';
