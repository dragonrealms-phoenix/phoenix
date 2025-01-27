import { EuiFieldText } from '@elastic/eui';
import type { KeyboardEvent, KeyboardEventHandler, ReactNode } from 'react';
import { useCallback } from 'react';
import { isEmpty } from '../../../common/string/string.utils.js';
import { useCommandHistory } from '../../hooks/command-history.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';
import { GameRoundTime } from './game-roundtime.jsx';

export interface GameBottomBarProps {
  todo?: true;
}

export const GameBottomBar: React.FC<GameBottomBarProps> = (
  _props: GameBottomBarProps
): ReactNode => {
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
    <EuiFieldText
      value={input}
      compressed={true}
      fullWidth={true}
      prepend={<GameRoundTime />}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onChange={handleOnChange}
    />
  );
};
