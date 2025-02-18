import type { ChangeEvent, KeyboardEvent } from 'react';
import { useMemo } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { isBlank } from '../../common/string/string.utils.js';

export interface CommandHistory {
  /**
   * The current input value.
   * Bind this to your input element's value.
   */
  input: string;
  /**
   * Imperatively set the input value.
   * Usually don't need to use this directly.
   * The `handleOnChange` method is more convenient.
   */
  setInput: (input: string) => void;
  /**
   * Imperatively set the history index.
   * Usually don't need to use this directly.
   * The `navigateHistory` method is more convenient.
   */
  setIndex: (index: number) => void;
  /**
   * Add a command to the history.
   * Usually don't need to use this directly.
   * The `handleKeyDown` method is more convenient.
   */
  addCommand: (command: string) => void;
  /**
   * Imperatively navigate the command history.
   * Usually don't need to use this directly.
   * The `handleKeyDown` method is more convenient.
   */
  navigateHistory: (direction: 'up' | 'down') => void;
  /**
   * Convenience method for navigating history based on keyboard events.
   * Bind this method to your input element's `onKeyDown` event.
   * The "up arrow" key navigates from newest to oldest commands.
   * The "down arrow" key navigates from oldest to newest commands.
   * The "enter" key adds the current input to the history.
   */
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  /**
   * Convenience method for updating the input value based on change events.
   * Bind this method to your input element's `onChange` event.
   * If you do not use this method, you must call `setInput` imperatively.
   */
  handleOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const useCommandHistory = (options?: {
  /**
   * The minimum number of characters in a command to add it to the history.
   * Anything less is not added.
   * Default is 3.
   */
  minChars?: number;
}): CommandHistory => {
  const minChars = options?.minChars ?? 3;

  const store = useCommandHistoryStore(
    // Technically, our state reducer is returning a new object
    // each time although the properties are the same.
    // Use the `useShallow` operator to prevent unnecessary re-renders.
    useShallow((state) => {
      return {
        input: state.input,
        setInput: state.setInput,
        setIndex: state.setIndex,
        addCommand: state.addCommand,
        navigateHistory: state.navigateHistory,
      };
    })
  );

  const api = useMemo(() => {
    return {
      input: store.input,
      setInput: (input: string) => {
        store.setInput(input);
      },
      setIndex: (index: number) => {
        store.setIndex(index);
      },
      addCommand: (command: string): void => {
        store.addCommand(command);
      },
      navigateHistory: (direction: 'up' | 'down'): void => {
        store.navigateHistory(direction);
      },
      handleKeyDown: (event: KeyboardEvent<HTMLInputElement>): void => {
        const command = event.currentTarget.value;
        if (event.code === 'ArrowUp') {
          store.navigateHistory('up');
        } else if (event.code === 'ArrowDown') {
          store.navigateHistory('down');
        } else if (event.code === 'Enter') {
          if (!isBlank(command)) {
            if (command.length >= minChars) {
              store.addCommand(command);
            }
            store.setInput('');
            store.setIndex(-1);
          }
        }
      },
      handleOnChange: (event: ChangeEvent<HTMLInputElement>): void => {
        store.setInput(event.currentTarget.value);
      },
    };
  }, [store, minChars]);

  return api;
};

interface CommandHistoryData {
  /**
   * The current input value.
   * Usually bound to an input text field.
   */
  input: string;
  /**
   * Any value that was in the input field before navigating the history.
   * This way if the user navigates back down to the beginning then
   * we can restore their original input.
   */
  unsavedInput: string | null;
  /**
   * List of historical commands.
   * Commands are added to the front of the list.
   * The first element is the most recent command.
   * The last element is the oldest command.
   */
  history: Array<string>;
  /**
   * The current index in the history.
   * `0` is the most recent command.
   * `history.length - 1` is the oldest command.
   * `-1` means to not be navigating, to show the current input.
   */
  index: number;
  setInput: (input: string) => void;
  setIndex: (index: number) => void;
  addCommand: (command: string) => void;
  navigateHistory: (direction: 'up' | 'down') => void;
}

const useCommandHistoryStore = create<CommandHistoryData>((set, get) => ({
  input: '',

  unsavedInput: null,

  history: Array<string>(),

  index: -1,

  setInput: (input: string): void => {
    set({ input, unsavedInput: null });
  },

  setIndex: (index: number): void => {
    set({ index });
  },

  addCommand: (command: string): void => {
    if (isBlank(command)) {
      return;
    }

    const { history } = get();

    // We push new commands to the front of the history.
    // So the previous command is the first element.
    const prevCmd = history[0];
    const currCmd = command.trim();

    // Avoid storing duplicate back-to-back commmands.
    // Cap length of history to last N commands.
    if (prevCmd !== currCmd) {
      const newHistory = [currCmd, ...history];
      if (newHistory.length > 20) {
        newHistory.pop();
      }
      set({ history: newHistory, index: -1 });
    }
  },

  navigateHistory: (direction: 'up' | 'down'): void => {
    const { history, index, unsavedInput } = get();

    const minIndex = -1;
    const maxIndex = history.length;

    let newIndex = index;

    if (direction === 'up') {
      if (newIndex === minIndex) {
        // Save the current input before navigating.
        set({ unsavedInput: get().input });
      }
      newIndex = Math.min(newIndex + 1, maxIndex - 1);
    } else if (direction === 'down') {
      newIndex = Math.max(newIndex - 1, minIndex);
    }

    set({ index: newIndex });

    if (newIndex === minIndex) {
      // Restore the unsaved input.
      set({ input: unsavedInput ?? '' });
    } else {
      // Restore the historical command.
      set({ input: history[newIndex] ?? '' });
    }
  },
}));
