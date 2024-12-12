import { it } from "@std/testing/bdd";

export { expect } from "@std/expect";
export {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
} from "@std/testing/bdd";
export { spy, stub } from "@std/testing/mock";
export { expectTypeOf } from "npm:expect-type";
export * from "./fn-mock.ts";
export * from "./partial-mock.ts";

export const test = it;
