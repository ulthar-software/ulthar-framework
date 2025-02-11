import type { Email } from "@fabric/core";
import isFQDN from "./is-fqdn.js";
import { isString } from "./is-string.js";

const emailUserPart = /^[a-z\d!\-_.]+$/i;

export function isEmail(value: unknown): value is Email {
  if (!isString(value)) {
    return false;
  }

  const parts = value.split("@");
  const domain = parts[1];

  if (!isFQDN(domain)) {
    return false;
  }

  const user = parts[0];

  if (!user) {
    return false;
  }

  const userParts = user.split(".");
  for (const part of userParts) {
    if (!part) return false;
    if (!emailUserPart.test(part)) return false;
  }

  return true;
}
