import type { ChildProcess } from 'node:child_process';
import { spawn } from 'node:child_process';
import { sleep } from '../../common/async/async.utils.js';
import { GameCode } from '../../common/game/types.js';
import { Preferences } from '../preference/preference.instance.js';
import { PreferenceKey } from '../preference/types.js';
import { logger } from './logger.js';
import type { LichProcessInfo } from './types.js';

export const startLichProcess = async (options: {
  gameCode: GameCode;
}): Promise<LichProcessInfo> => {
  const { gameCode } = options;

  const rubyPath = Preferences.get(PreferenceKey.LICH_RUBY_PATH);
  const lichPath = Preferences.get(PreferenceKey.LICH_PATH);
  const lichHost = Preferences.get(PreferenceKey.LICH_HOST);
  const lichPort = Preferences.get(PreferenceKey.LICH_PORT);
  const lichWait = Preferences.get(PreferenceKey.LICH_START_WAIT);
  const lichArgs = getLichArgs({ gameCode });

  const lichProcess = await new Promise<ChildProcess>((resolve, reject) => {
    logger.info('starting lich', {
      rubyPath,
      lichPath,
      lichArgs,
      lichHost,
      lichPort,
      lichWait,
    });

    const lichProcess = spawn(rubyPath!, [lichPath!, ...lichArgs]);

    lichProcess.once('error', (error) => {
      logger.error('lich process error', { error });
      reject(error);
    });

    sleep(lichWait! * 1000)
      .then(() => {
        resolve(lichProcess);
      })
      .catch((error) => {
        reject(error);
      });
  });

  return {
    pid: lichProcess.pid,
    host: lichHost!,
    port: lichPort!,
  };
};

const getLichArgs = (options: { gameCode: GameCode }): Array<string> => {
  const { gameCode } = options;

  const lichArgs = ['--dragonrealms', '--genie'];

  switch (gameCode) {
    case GameCode.PLATINUM:
      lichArgs.push('--platinum');
      break;
    case GameCode.FALLEN:
      lichArgs.push('--fallen');
      break;
    case GameCode.TEST:
      lichArgs.push('--test');
      break;
  }

  return lichArgs;
};
