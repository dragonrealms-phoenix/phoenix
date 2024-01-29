/**
 * Map of XML entities to their unescaped values.
 */
const UNESCAPABLE_ENTITIES: Record<string, string> = {
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  amp: '&',
};

const UNESCAPE_ENTITIES_REGEX = /&([a-zA-Z]+);/g;

/**
 * Unescapes XML entities.
 * For example, converts '&lt;' to '<'.
 *
 * By default, unescapes the following entities:
 * - &lt;
 * - &gt;
 * - &quot;
 * - &apos;
 * - &amp;
 */
export const unescapeEntities = (
  text: string,
  options?: {
    /**
     * Specify your own entities to unescape.
     * The keys should be the entity name like 'lt' or 'gt'.
     * The values should be the unescaped value like '<' or '>'.
     */
    entities?: Record<string, string>;
  }
): string => {
  const { entities = UNESCAPABLE_ENTITIES } = options ?? {};

  // Replaces the matched text with the return value of the callback function.
  // The capturing group just helps us identify which entity to unescape.
  return text.replace(
    UNESCAPE_ENTITIES_REGEX,
    (matchedText, capturedText, _index, _allText) => {
      return entities[capturedText] ?? matchedText;
    }
  );
};
