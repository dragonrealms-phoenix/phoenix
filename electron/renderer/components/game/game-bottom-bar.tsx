import { EuiFieldText } from '@elastic/eui';
import type { KeyboardEvent, KeyboardEventHandler, ReactNode } from 'react';
import { useCallback } from 'react';
import { isEmpty } from '../../../common/string/string.utils.js';
import { useCommandHistory } from '../../hooks/command-history.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';
import { GameCompass } from './game-compass.jsx';
import { GameRoundTime } from './game-roundtime.jsx';

export const GameBottomBar: React.FC = (): ReactNode => {
  const { input, handleKeyDown, handleOnChange } = useCommandHistory();

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event: KeyboardEvent<HTMLInputElement>) => {
      // Handle any history navigation.
      handleKeyDown(event);
      // Handle the "Enter" key to submit command to game.
      const command = event.currentTarget.value;
      if (event.code === 'Enter' && !isEmpty(command)) {
        runInBackground(async () => {
          await window.api.sendCommand(command);
        });
      }
    },
    [handleKeyDown]
  );

  return (
    <div
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        paddingTop: '5px',
        paddingBottom: '5px',
        paddingLeft: '5px',
        paddingRight: '10px',
      }}
    >
      <GameRoundTime />
      {/* TODO move to GameCommandInput */}
      <div css={{ paddingRight: '5px', width: '100%' }}>
        <EuiFieldText
          value={input}
          compressed={true}
          fullWidth={true}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onChange={handleOnChange}
        />
      </div>
      <GameCompass />
    </div>
  );
};

GameBottomBar.displayName = 'GameBottomBar';
