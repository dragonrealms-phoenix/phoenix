import { EuiIcon } from '@elastic/eui';
import { css } from '@emotion/react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { GameEvent } from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { useSubscribe } from '../../hooks/pubsub.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';

const compassStyle = css({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
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

const directionStyle = (direction: CompassDirection) => {
  const { rotation } = direction;
  return css({
    position: 'absolute',
    transform: `rotate(${rotation}deg) translate(20px) scale(1.2)`,
    transformOrigin: 'center',
    width: '12px',
    height: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  });
};

// The arrow icon points east (-->), so rotations are relative to that.
interface CompassDirection {
  name: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
  rotation: number;
}
const compassDirections: Array<CompassDirection> = [
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
  const [directions, setDirections] = useState<Array<string>>([]);

  useSubscribe(['game:event'], (gameEvent: GameEvent) => {
    if (gameEvent.type === GameEventType.COMPASS) {
      setDirections(gameEvent.directions);
    }
  });

  const centerIcon = useMemo(() => {
    if (directions.includes('out')) {
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
    return <EuiIcon title="out" type="dot" color="subdued" />;
  }, [directions]);

  const compassIcons = useMemo(() => {
    return compassDirections.map((direction) => {
      if (directions.includes(direction.name)) {
        return (
          <div key={direction.name} css={directionStyle(direction)}>
            <EuiIcon
              type="sortRight"
              color="danger"
              cursor="pointer"
              onClick={() => {
                runInBackground(async () => {
                  await window.api.sendCommand(direction.name);
                });
              }}
            />
          </div>
        );
      }
      return (
        <div key={direction.name} css={directionStyle(direction)}>
          <EuiIcon type="sortRight" color="subdued" />
        </div>
      );
    });
  }, [directions]);

  return (
    <div css={compassStyle}>
      {compassIcons}
      <div css={centerStyle}>{centerIcon}</div>
    </div>
  );
};

GameCompass.displayName = 'GameCompass';
