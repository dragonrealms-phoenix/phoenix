import { listCharacters, loginCharacter } from './sge.login';
import type {
  SGECharacter,
  SGEGameCode,
  SGEGameCredentials,
  SGEService,
} from './sge.types';

export class SGEServiceImpl implements SGEService {
  private username: string;
  private password: string;
  private gameCode: SGEGameCode;

  constructor(options: {
    username: string;
    password: string;
    gameCode: SGEGameCode;
  }) {
    this.username = options.username;
    this.password = options.password;
    this.gameCode = options.gameCode;
  }

  public async loginCharacter(
    characterName: string
  ): Promise<SGEGameCredentials> {
    const response = await loginCharacter({
      username: this.username,
      password: this.password,
      gameCode: this.gameCode,
      characterName,
    });
    return response.credentials;
  }

  public async listCharacters(): Promise<Array<SGECharacter>> {
    return listCharacters({
      username: this.username,
      password: this.password,
      gameCode: this.gameCode,
    });
  }
}
