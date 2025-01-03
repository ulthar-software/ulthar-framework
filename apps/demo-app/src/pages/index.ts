import { Page } from "@fabric/weaver";

const page: Page = {
  view: () => ({
    title: "Welcome to Fabric",
    tags: ["fabric", "weaver", "typescript"],
    body: [
      main({}, [
        title({}, "Welcome to Fabric"),
        text({}, "Fabric is a simple web framework written in TypeScript."),
        text({}, "It is built on top of the Weaver library"),
      ]),
    ],
  }),
};

export default page;
