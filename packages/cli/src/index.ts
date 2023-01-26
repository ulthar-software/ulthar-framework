#!/usr/bin/env node

import { createCLI } from "@ulthar/commandy";
import { loadConfig } from "./utils/load-config";
import { YARN } from "./utils/yarn";

const { TEMPLATES } = await loadConfig();

createCLI({
    name: "cli",
    commands: [
        {
            name: "package",
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
            ],
        },
        {
            name: "build",
            passExtraArgs: true,
            handler: async ({ extraArgs }) => {
                await YARN.workspacesRun(["build", ...extraArgs]);
            },
        },
        {
            name: "test",
            passExtraArgs: true,
            handler: async ({ extraArgs }) => {
                await YARN.run(["jest", "--verbose", ...extraArgs]);
            },
        },
    ],
}).run(process.argv);
