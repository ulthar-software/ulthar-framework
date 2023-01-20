#!/usr/bin/env node

import { createCLI } from "@ulthar/commandy";
import { loadConfig } from "./utils/load-config";
import { YARN } from "./utils/yarn";

const { TEMPLATES } = await loadConfig();

createCLI({
    name: "cli",
    commands: [
        {
            name: "new",
            args: [
                {
                    name: "packageName",
                },
            ],
            handler: async ({ packageName }) => {
                await YARN.addWorkspacePackage(packageName);
                await TEMPLATES["lib"].applyTo(packageName);
                await YARN.update();
            },
        },
        {
            name: "build",
            handler: async () => {
                await YARN.workspacesRun(["build"]);
            },
        },
        {
            name: "test",
            handler: async () => {
                await YARN.run(["jest", "--verbose"]);
            },
        },
    ],
}).run(process.argv);
