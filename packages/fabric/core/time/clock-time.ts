/**
 * Represents a time of day in hours, minutes, and seconds.
 */
export class ClockTime {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;

  constructor(hours?: number, minutes?: number, seconds?: number) {
    this.hours = hours ?? 0;
    this.minutes = minutes ?? 0;
    this.seconds = seconds ?? 0;
  }

  toString() {
    return `${this.hours}:${this.minutes}:${this.seconds}`;
  }

  static fromString(time: string): ClockTime {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return new ClockTime(hours, minutes, seconds);
  }
}
