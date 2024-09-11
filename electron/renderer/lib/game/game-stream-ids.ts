/**
 * The DragonRealms default game streams.
 * When the game socket sends data, it may be tagged with a stream id.
 * The stream id indicates which game "window" the data is intended for.
 * User-defined scripts may also output to custom streams, which
 * aren't represented here but which Phoenix will support.
 */
export enum GameStreamId {
  /**
   * The main story window. This is where most game output goes.
   * This content is unique in that there is no stream id for it.
   */
  MAIN = '',
  /**
   * When the game sends periodic experience updates.
   */
  EXPERIENCE = 'experience',
  /**
   * When the game sends periodic room updates.
   * Usually updated when you move rooms or when people enter/leave.
   */
  ROOM = 'room',
  /**
   * Displays what spells/abilities are active and their duration.
   */
  SPELLS = 'percWindow',
  /**
   * Lists inventory in the main container on your character.
   */
  INVENTORY = 'inv',
  /**
   * For Warrior Mages and characters who have magical pets.
   * This lets the player see what their familiar sees and does.
   * It might also be used by Empaths when perceiving wounds.
   */
  FAMILIAR = 'familiar',
  /**
   * Messages sent and received via gweths and other ESP items.
   */
  THOUGHTS = 'thoughts',
  /**
   * Most combat messages.
   */
  COMBAT = 'combat',
  /**
   * Output when you run the `ASSESS` verb.
   */
  ASSESS = 'assess',
  /**
   * The stream id is 'logons' but in game you toggle on/off for arrivals.
   * Only for characters who opt-in to disclose their logons.
   */
  ARRIVALS = 'logons',
  /**
   * Messages when characters die.
   * Only for characters who opt-in to disclose their deaths.
   */
  DEATHS = 'deaths',
  /**
   * Periodic messaging from items with atmospheric effects.
   */
  ATMOSPHERICS = 'atmospherics',
  /**
   * Similar to `THOUGHTS` but for game-wide chat for beginners.
   */
  CHATTER = 'chatter',
  /**
   * No idea.
   */
  CONVERSATION = 'conversation',
  /**
   * When players send and receive whispers via `WHISPER` verb.
   */
  WHISPERS = 'whispers',
  /**
   * No idea.
   */
  TALK = 'talk',
  /**
   * When players send and receive messages via `OOC` verb.
   */
  OOC = 'ooc',
  /**
   * No idea. Maybe things that happen when a character is in a group?
   */
  GROUP = 'group',
}

export interface GameStreamItemInfo {
  /**
   * Unique identifier for the game stream.
   * Assigned by DragonRealms.
   * Example: 'percWindow' (spells) or '' (main).
   */
  streamId: GameStreamId;

  /**
   * Unique identifier for the stream for our purposes.
   * Generally is the same value as the `streamId` except
   * for the main stream which is 'main' instead of empty string.
   */
  itemId: string;

  /**
   * User-friendly title for the game stream.
   * Example: 'Spells' or 'Main'.
   */
  itemTitle: string;
}

/**
 * Users will be allowed to create new streams to customize how
 * game content is routed to the UI. Sometimes custom scripts output
 * to specific streams, or DragonRealms introduces new streams before
 * we update the code to support them.
 *
 * This array is the default set of streams that we know DragonRealms supports.
 */
export const DefaultGameStreamItemInfos: Array<GameStreamItemInfo> = [
  {
    streamId: GameStreamId.MAIN, // special case, it's an empty string
    itemId: 'main', // special case since the stream id is empty text
    itemTitle: 'Main',
  },
  {
    streamId: GameStreamId.EXPERIENCE,
    itemId: GameStreamId.EXPERIENCE,
    itemTitle: 'Experience',
  },
  {
    streamId: GameStreamId.ROOM,
    itemId: GameStreamId.ROOM,
    itemTitle: 'Room',
  },
  {
    streamId: GameStreamId.SPELLS,
    itemId: GameStreamId.SPELLS,
    itemTitle: 'Spells',
  },
  {
    streamId: GameStreamId.INVENTORY,
    itemId: GameStreamId.INVENTORY,
    itemTitle: 'Inventory',
  },
  {
    streamId: GameStreamId.FAMILIAR,
    itemId: GameStreamId.FAMILIAR,
    itemTitle: 'Familiar',
  },
  {
    streamId: GameStreamId.THOUGHTS,
    itemId: GameStreamId.THOUGHTS,
    itemTitle: 'Thoughts',
  },
  {
    streamId: GameStreamId.COMBAT,
    itemId: GameStreamId.COMBAT,
    itemTitle: 'Combat',
  },
  {
    streamId: GameStreamId.ASSESS,
    itemId: GameStreamId.ASSESS,
    itemTitle: 'Assess',
  },
  {
    streamId: GameStreamId.ARRIVALS,
    itemId: GameStreamId.ARRIVALS,
    itemTitle: 'Arrivals',
  },
  {
    streamId: GameStreamId.DEATHS,
    itemId: GameStreamId.DEATHS,
    itemTitle: 'Deaths',
  },
  {
    streamId: GameStreamId.ATMOSPHERICS,
    itemId: GameStreamId.ATMOSPHERICS,
    itemTitle: 'Atmospherics',
  },
  {
    streamId: GameStreamId.CHATTER,
    itemId: GameStreamId.CHATTER,
    itemTitle: 'Chatter',
  },
  {
    streamId: GameStreamId.CONVERSATION,
    itemId: GameStreamId.CONVERSATION,
    itemTitle: 'Conversation',
  },
  {
    streamId: GameStreamId.WHISPERS,
    itemId: GameStreamId.WHISPERS,
    itemTitle: 'Whispers',
  },
  {
    streamId: GameStreamId.TALK,
    itemId: GameStreamId.TALK,
    itemTitle: 'Talk',
  },
  {
    streamId: GameStreamId.OOC,
    itemId: GameStreamId.OOC,
    itemTitle: 'OOC',
  },
  {
    streamId: GameStreamId.GROUP,
    itemId: GameStreamId.GROUP,
    itemTitle: 'Group',
  },
];
