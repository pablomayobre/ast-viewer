/**
 * Represents a code selection or highlighting from
 * "startPos" to "endPos"
 */

export type TextPosition = {
  line: number;
  column: number;
};

export interface CodeSelection {
  startPos: TextPosition;
  endPos: TextPosition;
}
