import { PosixDate } from "../../../time/posix-date.js";
import type { TimeService } from "../time-service.js";

export class TimeServiceMock implements TimeService {
  private currentTime: PosixDate | null = null;

  now(): PosixDate {
    return this.currentTime ?? new PosixDate();
  }

  isTimeStopped(): boolean {
    return this.currentTime !== null;
  }

  setTime(time: PosixDate): void {
    this.currentTime = time;
  }

  stopTime() {
    this.currentTime = new PosixDate();
  }

  resumeTime() {
    this.currentTime = null;
  }

  advanceTime(milliseconds: number): void {
    if (!this.currentTime) {
      this.currentTime = new PosixDate();
    }
    this.currentTime = this.currentTime.add(milliseconds);
  }

  rewindTime(milliseconds: number): void {
    if (!this.currentTime) {
      this.currentTime = new PosixDate();
    }
    this.currentTime = this.currentTime.add(-milliseconds);
  }
}
