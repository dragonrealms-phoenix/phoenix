import isEqual from 'lodash-es/isEqual.js';
import sortBy from 'lodash-es/sortBy.js';
import { useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { isBlank } from '../../common/string/is-blank.js';
import { runInBackground } from '../lib/async/run-in-background.js';
import type { Character } from '../types/game.types.js';
import { usePubSub, useSubscribe } from './pubsub.jsx';

/**
 * Returns a list of characters.
 * Automatically refreshes the list when a character is saved or removed.
 */
export const useListCharacters = (options?: {
  accountName: string;
}): Array<Character> => {
  const [characters, setCharacters] = useState<Array<Character>>([]);

  const loadCharacters = useCallback(async () => {
    const accountName = options?.accountName;

    const allCharacters = await window.api.listCharacters();
    const filteredCharacters = allCharacters.filter((character) => {
      return isBlank(accountName) || character.accountName === accountName;
    });
    const sortedCharacters = sortBy(filteredCharacters, 'characterName');
    setCharacters(sortedCharacters);
  }, [options?.accountName]);

  // Reload when told to.
  useSubscribe(['characters:reload'], async () => {
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

type SaveCharacterFn = (character: Character) => Promise<void>;

/**
 * Provides a function that when called saves a character.
 */
export const useSaveCharacter = (): SaveCharacterFn => {
  const { publish } = usePubSub();

  const fn = useCallback<SaveCharacterFn>(
    async (character): Promise<void> => {
      publish('character:saving', character);
      await window.api.saveCharacter(character);
      publish('character:saved', character);
      publish('characters:reload');
    },
    [publish]
  );

  return fn;
};

type RemoveCharacterFn = (character: Character) => Promise<void>;

/**
 * Provides a function that when called removes a character.
 * If the character is currently playing, it will be quit first.
 */
export const useRemoveCharacter = (): RemoveCharacterFn => {
  const { publish } = usePubSub();

  const playingCharacter = usePlayingCharacter();
  const quitCharacter = useQuitCharacter();

  const fn = useCallback<RemoveCharacterFn>(
    async (character): Promise<void> => {
      publish('character:removing', character);
      if (isEqual(playingCharacter, character)) {
        await quitCharacter();
      }
      await window.api.removeCharacter(character);
      publish('character:removed', character);
      publish('characters:reload');
    },
    [playingCharacter, quitCharacter, publish]
  );

  return fn;
};

type PlayCharacterFn = (character: Character) => Promise<void>;

/**
 * Provides a function that when called plays a character.
 * If another character is already playing, it will be quit first.
 */
export const usePlayCharacter = (): PlayCharacterFn => {
  const { publish } = usePubSub();

  const setPlayingCharacter = useSetPlayingCharacter();
  const quitCharacter = useQuitCharacter();

  const fn = useCallback<PlayCharacterFn>(
    async (character): Promise<void> => {
      try {
        publish('character:play:starting', character);
        await quitCharacter(); // quit any currently playing character, if any
        await window.api.playCharacter(character);
        setPlayingCharacter(character);
        publish('character:play:started', character);
        publish('characters:reload');
      } catch (error) {
        publish('character:play:error', {
          title: 'Error playing character',
          error,
          character,
        });
      }
    },
    [setPlayingCharacter, quitCharacter, publish]
  );

  return fn;
};

type QuitCharacterFn = () => Promise<void>;

/**
 * Provides a function that when called quits the current playing character.
 */
export const useQuitCharacter = (): QuitCharacterFn => {
  const { publish } = usePubSub();

  const playingCharacter = usePlayingCharacter();
  const setPlayingCharacter = useSetPlayingCharacter();

  const fn = useCallback<QuitCharacterFn>(async (): Promise<void> => {
    if (playingCharacter) {
      try {
        publish('character:play:stopping', playingCharacter);
        await window.api.quitCharacter();
        setPlayingCharacter(undefined);
        publish('character:play:stopped', playingCharacter);
        publish('characters:reload');
      } catch (error) {
        publish('character:play:error', {
          title: 'Error quitting character',
          error,
          character: playingCharacter,
        });
      }
    }
  }, [playingCharacter, setPlayingCharacter, publish]);

  return fn;
};

/**
 * Returns the character currently being played, if any.
 */
export const usePlayingCharacter = (): Character | undefined => {
  const { playingCharacter } = characterStore(
    useShallow((state) => {
      return {
        playingCharacter: state.playingCharacter,
      };
    })
  );

  return playingCharacter;
};

/**
 * Internal only.
 * Use the `usePlayCharacter` hook instead.
 */
const useSetPlayingCharacter = (): ((character?: Character) => void) => {
  const { setPlayingCharacter } = characterStore(
    useShallow((state) => {
      return {
        setPlayingCharacter: state.setPlayingCharacter,
      };
    })
  );

  return setPlayingCharacter;
};

interface CharacterStoreData {
  /**
   * The character currently being played, if any.
   */
  playingCharacter?: Character;

  /**
   * Sets the character currently being played.
   * To signal that no character is playing, pass `undefined`.
   */
  setPlayingCharacter: (character?: Character) => void;
}

const characterStore = create<CharacterStoreData>((set) => ({
  playingCharacter: undefined,

  setPlayingCharacter: (character) => {
    set({ playingCharacter: character });
  },
}));
