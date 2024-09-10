export interface GameStreamId {
  /**
   * User-friendly title for the game stream.
   * Example: 'Spells' or 'Main'.
   */
  title: string;

  /**
   * Unique identifier for the game stream.
   * Assigned by DragonRealms.
   * Example: 'percWindow' (spells) or '' (main).
   */
  streamId: string;

  /**
   * Unique identifier for the stream for our purposes.
   * Generally is the same value as the `streamId` except
   * for the main stream which is 'main' instead of empty string.
   */
  itemId: string;
}

/**
 * Users will be allowed to create new streams to customize how
 * game content is routed to the UI. Sometimes custom scripts output
 * to specific streams, or DragonRealms introduces new streams before
 * we update the code to support them.
 *
 * This array is the default set of streams that we know DragonRealms supports.
 */
export const DefaultGameStreamIds: Array<GameStreamId> = [
  {
    title: 'Main',
    streamId: '',
    itemId: 'main',
  },
  {
    title: 'Experience',
    streamId: 'experience',
    itemId: 'experience',
  },
  {
    title: 'Room',
    streamId: 'room',
    itemId: 'room',
  },
  {
    title: 'Spells',
    streamId: 'percWindow',
    itemId: 'percWindow',
  },
  {
    title: 'Inventory',
    streamId: 'inv',
    itemId: 'inv',
  },
  {
    title: 'Familiar',
    streamId: 'familiar',
    itemId: 'familiar',
  },
  {
    title: 'Thoughts',
    streamId: 'thoughts',
    itemId: 'thoughts',
  },
  {
    title: 'Combat',
    streamId: 'combat',
    itemId: 'combat',
  },
  {
    title: 'Assess',
    streamId: 'assess',
    itemId: 'assess',
  },
  {
    title: 'Arrivals',
    streamId: 'logons',
    itemId: 'logons',
  },
  {
    title: 'Deaths',
    streamId: 'deaths',
    itemId: 'deaths',
  },
  {
    title: 'Atmospherics',
    streamId: 'atmospherics',
    itemId: 'atmospherics',
  },
  {
    title: 'Chatter',
    streamId: 'chatter',
    itemId: 'chatter',
  },
  {
    title: 'Conversation',
    streamId: 'conversation',
    itemId: 'conversation',
  },
  {
    title: 'Whispers',
    streamId: 'whispers',
    itemId: 'whispers',
  },
  {
    title: 'Talk',
    streamId: 'talk',
    itemId: 'talk',
  },
  {
    title: 'OOC',
    streamId: 'ooc',
    itemId: 'ooc',
  },
  {
    title: 'Group',
    streamId: 'group',
    itemId: 'group',
  },
];
