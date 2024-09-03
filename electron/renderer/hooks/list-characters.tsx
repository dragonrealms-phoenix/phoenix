import { sortBy } from 'lodash-es';
import { useEffect, useState } from 'react';
import { isBlank } from '../../common/string/is-blank.js';
import { runInBackground } from '../lib/async/run-in-background.js';
import type { Character } from '../types/game.types.js';

export interface UseListCharactersProps {
  accountName?: string;
}

export function useListCharacters(
  props?: UseListCharactersProps
): Array<Character> {
  const { accountName } = props ?? {};

  const [characters, setCharacters] = useState<Array<Character>>([]);

  // TODO subscribe to pubsub to know when should reload characters
  //      e.g. when an account/contact is added, updated, or removed

  useEffect(() => {
    runInBackground(async () => {
      const allCharacters = await window.api.listCharacters();

      const filteredCharacters = allCharacters.filter((character) => {
        return isBlank(accountName) || character.accountName === accountName;
      });

      const sortedCharacters = sortBy(
        filteredCharacters,
        'accountName',
        'characterName'
      );

      setCharacters(sortedCharacters);
    });
  }, [accountName]);

  return characters;
}
