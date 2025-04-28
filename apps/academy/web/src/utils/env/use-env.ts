import { useContext } from "react";
import type { EnvSchema } from "./env-context.ts";
import { EnvContext } from "./env-context.ts";

export function useEnv(key: keyof EnvSchema) {
  const env = useContext(EnvContext);
  return env.get(key);
}
