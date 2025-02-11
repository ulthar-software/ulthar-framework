import routes from "./routes.js";
import "./style.css";

import { createApp, getSessionFromStorage, type Session } from "@fabric/weaver";

export interface AppModel {
  currentSession: Session | null;
}

export interface AppDependencies {
  localStorage: Storage;
}

await createApp<AppModel, AppDependencies>({
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
  dependencies: {
    localStorage,
    window,
    document,
    env: {
      WEAVER_MODE: "dev",
    },
  },
});
