import "./style.css";

import { createApp, getSessionFromStorage } from "@fabric/weaver";

createApp({
  init: (startURL) => {
    return [
      {
        currentSession: getSessionFromStorage(),
      },
      undefined,
    ];
  },
});
