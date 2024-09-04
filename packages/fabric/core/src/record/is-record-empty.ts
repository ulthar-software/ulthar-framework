/**
 *  Check if a record is empty (A record is empty when it doesn't contain any keys).
 */
export function isRecordEmpty(value: Record<string, unknown>): boolean {
  return Object.keys(value).length === 0;
}
