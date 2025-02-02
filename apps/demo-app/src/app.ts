import routes from "./routes.ts";
import "./style.css";

import { createApp, getSessionFromStorage, Session } from "@fabric/weaver";

export interface AppModel {
  currentSession: Session | null;
}

export interface AppDependencies {
  localStorage: Storage;
}

// deno-lint-ignore no-empty-interface
export interface AppEnv {
}

createApp<AppModel, AppDependencies, AppEnv>({
  init: () => {
    return [
      {
        currentSession: null,
      },
      getSessionFromStorage().map((session) => ({
        currentSession: session.value,
      })),
    ];
  },
  defaultRoute: "HOME",
  routes,
  env: {
    WEAVER_MODE: "dev",
  },
});
