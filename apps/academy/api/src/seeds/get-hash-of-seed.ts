import type { Fn } from "@fabric/core";
import crypto from "node:crypto";

export function getHashOfSeed(seed: Fn) {
  const hash = crypto.createHash("sha256");
  hash.update(seed.toString());
  return hash.digest("hex");
}
