import { describe, expect, test } from "@fabric/testing";
import { PosixDate } from "./posix-date.js";

describe("PosixDate", () => {
  test("constructor should create a PosixDate with the current timestamp", () => {
    const date = new PosixDate();
    expect(date.timestamp).toBeLessThanOrEqual(Date.now());
  });

  test("constructor should create a PosixDate with the provided timestamp", () => {
    const timestamp = 1627849200000;
    const date = new PosixDate(timestamp);
    expect(date.timestamp).toBe(timestamp);
  });

  test("static function 'now' works as an empty constructor", () => {
    const date = PosixDate.now();
    expect(date).toBeInstanceOf(PosixDate);
    expect(date.timestamp).toBeLessThanOrEqual(Date.now());
  });

  test("add should return a new PosixDate with the timestamp increased by the specified milliseconds", () => {
    const date = new PosixDate(1627849200000);
    const addedDate = date.add(60000); // Add 1 minute (60000 milliseconds)
    expect(addedDate.timestamp).toBe(1627849260000);
  });

  test("isBefore should return true if the current date is before the other date", () => {
    const date1 = new PosixDate(1627849200000);
    const date2 = new PosixDate(1627849260000);
    expect(date1.isBefore(date2)).toBe(true);
  });

  test("isAfter should return true if the current date is after the other date", () => {
    const date1 = new PosixDate(1627849260000);
    const date2 = new PosixDate(1627849200000);
    expect(date1.isAfter(date2)).toBe(true);
  });
});
