export interface RegExpMatchResult {
  /**
   * The matched text.
   */
  text: string;
  /**
   * The start index of the match in the original text.
   */
  start: number;
  /**
   * The end index of the match in the original text.
   */
  end: number;
}
