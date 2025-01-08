import { h1, Page } from "@fabric/weaver";

const page: Page = {
  view: () => ({
    title: "Welcome to Fabric",
    tags: ["fabric", "weaver", "typescript"],
    body: [
      h1({ className: "px-4" }, "Welcome to Fabric"),
    ],
  }),
};

export default page;
