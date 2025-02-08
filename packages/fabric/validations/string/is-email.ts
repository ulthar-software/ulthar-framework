import type { Email } from "@fabric/core";
import isFQDN from "./is-fqdn.ts";
import { isString } from "./is-string.ts";

const emailUserPart = /^[a-z\d!\-_\.]+$/i;

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

  const user_parts = user.split(".");
  for (let i = 0; i < user_parts.length; i++) {
    const part = user_parts[i];
    if (!part) return false;
    if (!emailUserPart.test(part)) return false;
  }

  return true;
}
