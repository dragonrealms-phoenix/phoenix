import { EuiFieldText, EuiIcon } from '@elastic/eui';
import type {
  ChangeEvent,
  KeyboardEvent,
  KeyboardEventHandler,
  ReactNode,
} from 'react';
import { useCallback, useState } from 'react';
import { isEmpty } from '../../../common/string/string.utils.js';
import { useCommandHistory } from '../../hooks/command-history.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';

export const GameCommandInput: React.FC = (): ReactNode => {
  const { input, handleKeyDown, handleOnChange } = useCommandHistory();
  const [lastCommand, setLastCommand] = useState<string>();

  const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event: KeyboardEvent<HTMLInputElement>) => {
      // Handle any history navigation.
      handleKeyDown(event);
      // Handle the "Enter" key to submit command to game.
      if (event.code === 'Enter') {
        const command = event.currentTarget.value;
        // <Cmd>+<Enter> = perform last command
        if (event.metaKey && !isEmpty(lastCommand)) {
          runInBackground(async () => {
            await window.api.sendCommand(lastCommand);
          });
        }
        // <Enter> = perform new command
        else if (!isEmpty(command)) {
          setLastCommand(command);
          runInBackground(async () => {
            await window.api.sendCommand(command);
          });
        }
      }
    },
    [handleKeyDown, lastCommand]
  );

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // Sync the input value with the command history.
      // Otherwise you don't see what you type into the box.
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
        autoFocus={true}
        autoCorrect="off"
        autoCapitalize="off"
        autoComplete="off"
        prepend={<EuiIcon type="arrowRight" size="s" color="primary" />}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onChange={onChange}
      />
    </div>
  );
};

GameCommandInput.displayName = 'GameCommandInput';
