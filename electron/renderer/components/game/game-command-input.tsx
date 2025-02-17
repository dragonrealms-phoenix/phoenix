import { EuiFieldText, EuiIcon } from '@elastic/eui';
import type {
  ChangeEvent,
  KeyboardEvent,
  KeyboardEventHandler,
  ReactElement,
  ReactNode,
} from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';
import { isEmpty } from '../../../common/string/string.utils.js';
import { GameContext } from '../../context/game.jsx';
import { useCommandHistory } from '../../hooks/commands.jsx';
import { runInBackground } from '../../lib/async/run-in-background.js';

export const GameCommandInput: React.FC = (): ReactNode => {
  const { isConnected } = useContext(GameContext);
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
          // TODO customize the command separator, and whether to use it or not
          const cmds = command.split(';');
          runInBackground(async () => {
            for (const cmd of cmds) {
              await window.api.sendCommand(cmd);
            }
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

  const commandIcon = useMemo((): ReactElement => {
    return <EuiIcon type="arrowRight" size="s" color="primary" />;
  }, []);

  const commandInput = useMemo((): ReactElement => {
    return (
      <div
        css={{
          width: '100%',
          paddingInline: '5px',
        }}
      >
        <EuiFieldText
          css={{
            // Removes the bottom blue border when user focuses the field.
            // I found it distracting.
            backgroundImage: 'unset',
          }}
          value={input}
          compressed={true}
          fullWidth={true}
          autoFocus={true}
          autoCorrect="off"
          autoCapitalize="off"
          autoComplete="off"
          prepend={commandIcon}
          tabIndex={0}
          disabled={!isConnected}
          onKeyDown={onKeyDown}
          onChange={onChange}
        />
      </div>
    );
  }, [isConnected, input, commandIcon, onKeyDown, onChange]);

  return commandInput;
};

GameCommandInput.displayName = 'GameCommandInput';
