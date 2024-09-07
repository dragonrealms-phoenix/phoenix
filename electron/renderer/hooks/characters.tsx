import { sortBy } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { runInBackground } from '../lib/async/run-in-background.js';
import type { Character } from '../types/game.types.js';
import { usePubSub, useSubscribe } from './pubsub.jsx';

/**
 * Returns a list of characters.
 * Automatically refreshes the list when an character is saved or removed.
 */
export const useListCharacters = (): Array<Character> => {
  const [characters, setCharacters] = useState<Array<Character>>([]);

  const loadCharacters = useCallback(async () => {
    const allCharacters = await window.api.listCharacters();
    const sortedCharacters = sortBy(allCharacters, 'characterName');
    setCharacters(sortedCharacters);
  }, []);

  // Reload when told to.
  useSubscribe('characters:reload', async () => {
    await loadCharacters();
  });

  // Reload on first render.
  useEffect(() => {
    runInBackground(async () => {
      await loadCharacters();
    });
  }, [loadCharacters]);

  return characters;
};

type SaveCharacterFn = (options: {
  accountName: string;
  characterName: string;
  gameCode: string;
}) => Promise<void>;

/**
 * Provides a function that when called saves an character.
 */
export const useSaveCharacter = (): SaveCharacterFn => {
  const { publish } = usePubSub();

  const fn = useCallback<SaveCharacterFn>(
    async (options): Promise<void> => {
      const { accountName, characterName, gameCode } = options;
      await window.api.saveCharacter({
        accountName,
        characterName,
        gameCode,
      });
      publish('character:saved', {
        accountName,
        characterName,
        gameCode,
      });
      publish('characters:reload');
    },
    [publish]
  );

  return fn;
};

type RemoveCharacterFn = (options: {
  accountName: string;
  characterName: string;
  gameCode: string;
}) => Promise<void>;

/**
 * Provides a function that when called removes an character.
 */
export const useRemoveCharacter = (): RemoveCharacterFn => {
  const { publish } = usePubSub();

  const fn = useCallback<RemoveCharacterFn>(
    async (options): Promise<void> => {
      const { accountName, characterName, gameCode } = options;
      await window.api.removeCharacter({
        accountName,
        characterName,
        gameCode,
      });
      publish('character:removed', {
        accountName,
        characterName,
        gameCode,
      });
      publish('characters:reload');
    },
    [publish]
  );

  return fn;
};
