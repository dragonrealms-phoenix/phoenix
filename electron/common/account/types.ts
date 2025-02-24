import type { GameCode } from '../game/types.js';

export interface Account {
  accountName: string;
}

export interface AccountWithPassword extends Account {
  accountPassword: string;
}

export interface Character {
  accountName: string;
  characterName: string;
  gameCode: GameCode;
}
