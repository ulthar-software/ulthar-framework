import homePage from "./pages/index.ts";
import routes from "./routes.ts";
import "./style.css";

import { createApp, getSessionFromStorage, Session } from "@fabric/weaver";

export interface AppModel {
  currentSession: Session | null;
}

export interface AppDependencies {
  localStorage: Storage;
}

createApp<AppModel, AppDependencies>({
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
  homePage,
  routes,
});
