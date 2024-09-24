import type { GameItemInfo } from '../../types/game.types.js';
import { GameItemId } from '../../types/game.types.js';

const GameItemInfosById: Readonly<Record<GameItemId, GameItemInfo>> = {
  main: {
    streamId: '', // special case
    itemId: GameItemId.MAIN,
    itemTitle: 'Main',
  },
  experience: {
    streamId: 'experience',
    itemId: GameItemId.EXPERIENCE,
    itemTitle: 'Experience',
  },
  room: {
    streamId: 'room',
    itemId: GameItemId.ROOM,
    itemTitle: 'Room',
  },
  spells: {
    streamId: 'percWindow',
    itemId: GameItemId.SPELLS,
    itemTitle: 'Spells',
  },
  inventory: {
    streamId: 'inv',
    itemId: GameItemId.INVENTORY,
    itemTitle: 'Inventory',
  },
  familiar: {
    streamId: 'familiar',
    itemId: GameItemId.FAMILIAR,
    itemTitle: 'Familiar',
  },
  thoughts: {
    streamId: 'thoughts',
    itemId: GameItemId.THOUGHTS,
    itemTitle: 'Thoughts',
  },
  combat: {
    streamId: 'combat',
    itemId: GameItemId.COMBAT,
    itemTitle: 'Combat',
  },
  assess: {
    streamId: 'assess',
    itemId: GameItemId.ASSESS,
    itemTitle: 'Assess',
  },
  arrivals: {
    streamId: 'logons',
    itemId: GameItemId.ARRIVALS,
    itemTitle: 'Arrivals',
  },
  deaths: {
    streamId: 'deaths',
    itemId: GameItemId.DEATHS,
    itemTitle: 'Deaths',
  },
  atmospherics: {
    streamId: 'atmospherics',
    itemId: GameItemId.ATMOSPHERICS,
    itemTitle: 'Atmospherics',
  },
  chatter: {
    streamId: 'chatter',
    itemId: GameItemId.CHATTER,
    itemTitle: 'Chatter',
  },
  conversation: {
    streamId: 'conversation',
    itemId: GameItemId.CONVERSATION,
    itemTitle: 'Conversation',
  },
  whispers: {
    streamId: 'whispers',
    itemId: GameItemId.WHISPERS,
    itemTitle: 'Whispers',
  },
  talk: {
    streamId: 'talk',
    itemId: GameItemId.TALK,
    itemTitle: 'Talk',
  },
  ooc: {
    streamId: 'ooc',
    itemId: GameItemId.OOC,
    itemTitle: 'OOC',
  },
  group: {
    streamId: 'group',
    itemId: GameItemId.GROUP,
    itemTitle: 'Group',
  },
};

export const getGameItemInfo = (itemId: GameItemId): GameItemInfo => {
  return GameItemInfosById[itemId];
};
