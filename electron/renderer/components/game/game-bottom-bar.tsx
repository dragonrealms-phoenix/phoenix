import type { ReactNode } from 'react';
import { GameCommandInput } from './game-command-input.jsx';
import { GameCompass } from './game-compass.jsx';
import { GameHands } from './game-hands.jsx';
import { GameRoundTime } from './game-roundtime.jsx';
import { GameStatusIcons } from './game-status-icons.jsx';

export const GameBottomBar: React.FC = (): ReactNode => {
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <GameRoundTime />
        <GameCompass />
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            paddingInline: '5px',
            gap: '5px',
          }}
        >
          <GameHands />
          <GameStatusIcons />
        </div>
      </div>
      <GameCommandInput />
    </div>
  );
};

GameBottomBar.displayName = 'GameBottomBar';
