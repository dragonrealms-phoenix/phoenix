import { useEuiTheme } from '@elastic/eui';
import { useState } from 'react';
import type { GameEvent } from '../../../common/game/types.js';
import { GameEventType } from '../../../common/game/types.js';
import { useSubscribe } from '../../hooks/pubsub.jsx';

export const GameHands: React.FC = () => {
  const { euiTheme } = useEuiTheme();

  const [leftHand, setLeftHand] = useState<string>('Empty');
  const [rightHand, setRightHand] = useState<string>('Empty');
  const [spell, setSpell] = useState<string>('None');

  useSubscribe(['game:event'], (gameEvent: GameEvent) => {
    switch (gameEvent.type) {
      case GameEventType.LEFT_HAND:
        setLeftHand(gameEvent.item);
        break;
      case GameEventType.RIGHT_HAND:
        setRightHand(gameEvent.item);
        break;
      case GameEventType.SPELL:
        setSpell(gameEvent.spell);
        break;
    }
  });

  return (
    <div
      css={{
        display: 'block',
        justifyContent: 'center',
        alignContent: 'center',
        width: '300px',
        height: '100%',
        fontSize: euiTheme.size.m,
      }}
    >
      {[
        { label: 'Left', value: leftHand },
        { label: 'Right', value: rightHand },
        { label: 'Spell', value: spell },
      ].map(({ label, value }) => (
        <div key={label} css={{ display: 'flex', gap: '5px' }}>
          <b css={{ textAlign: 'right', minWidth: '45px' }}>{label}:</b>
          {value}
        </div>
      ))}
    </div>
  );
};

GameHands.displayName = 'GameHands';
