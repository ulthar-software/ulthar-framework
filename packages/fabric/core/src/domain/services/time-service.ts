import type { PosixDate } from "../../time/posix-date.js";

export interface TimeService {
  /**
   * Gets the current time.
   * @returns The current time.
   */
  now(): PosixDate;
}
