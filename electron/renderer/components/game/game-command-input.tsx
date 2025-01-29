import { EuiFieldText } from '@elastic/eui';
import type {
  ChangeEvent,
  KeyboardEvent,
  KeyboardEventHandler,
  ReactNode,
} from 'react';
import { useCallback } from 'react';
import { isEmpty } from '../../../common/string/string.utils.js';
import { useCommandHistory } from '../../hooks/command-history.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';

export const GameCommandInput: React.FC = (): ReactNode => {
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

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // Sync the input value with the command history.
      handleOnChange(event);
    },
    [handleOnChange]
  );

  return (
    <div css={{ width: '100%' }}>
      <EuiFieldText
        value={input}
        compressed={true}
        fullWidth={true}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onChange={onChange}
      />
    </div>
  );
};

GameCommandInput.displayName = 'GameCommandInput';
