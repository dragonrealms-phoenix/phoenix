import { EuiFieldText } from '@elastic/eui';
import type { KeyboardEventHandler, ReactNode } from 'react';
import { useCallback } from 'react';
import { isEmpty } from '../../../common/string/string.utils.js';
import { runInBackground } from '../../lib/async/run-in-background.js';

export interface GameBottomBarProps {
  // TODO
  todo?: true;
}

export const GameBottomBar: React.FC<GameBottomBarProps> = (
  props: GameBottomBarProps
): ReactNode => {
  // TODO move to a new GameCommandInput component
  const onKeyDownCommandInput = useCallback<
    KeyboardEventHandler<HTMLInputElement>
  >((event) => {
    const command = event.currentTarget.value;
    // TODO implement command history to track last N commands
    //      pressing up/down arrow keys should cycle through history
    //      pressing down arrow key when at the end of history should clear input
    //      pressing up arrow key when at the beginning of history should do nothing
    if (event.code === 'Enter' && !isEmpty(command)) {
      event.currentTarget.value = '';
      runInBackground(async () => {
        await window.api.sendCommand(command);
      });
    }
  }, []);

  return (
    <EuiFieldText
      compressed={true}
      fullWidth={true}
      prepend={'RT'}
      tabIndex={0}
      onKeyDown={onKeyDownCommandInput}
    />
  );
};

GameBottomBar.displayName = 'GameBottomBar';
