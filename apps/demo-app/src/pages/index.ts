import { h1, Page, text } from "@fabric/weaver";

import routes from "../routes.ts";

console.log(routes);

const page: Page = {
  view: () => ({
    title: "Welcome to Fabric",
    description: "A simple example of a Fabric page.",
    keywords: ["fabric", "weaver", "typescript"],
    body: [
      h1({ class: "px-4" }, [text("Welcome to Test!!")]),
    ],
  }),
};

export default page;
