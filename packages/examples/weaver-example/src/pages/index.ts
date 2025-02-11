import { h1, type Page, text } from "@fabric/weaver";

const page: Page = {
  view: () => ({
    title: "Welcome to Fabric",
    meta: {},
    body: [h1({ class: "px-4" }, [text("Welcome to Test!!")])],
  }),
};

export default page;
