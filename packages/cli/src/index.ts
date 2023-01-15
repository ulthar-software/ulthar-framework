#!/usr/bin/env node

import { createCLI } from "@ulthar/commandy";
import { $ } from "@ulthar/shelly";

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
                await $([`yarn`, `packages/${packageName}`, `init`]);
                await $([
                    "cp",
                    "-r",
                    "packages/package-template/*",
                    `packages/${packageName}`,
                ]);
                await $([
                    "sed -i",
                    `s/package-template/${packageName}/g`,
                    `packages/${packageName}/README.md`,
                ]);
                await $([
                    "sed -i",
                    `s/package-template/${packageName}/g`,
                    `packages/${packageName}/package.json`,
                ]);
                await $([`yarn`, `install`]);
            },
        },
        {
            name: "build",
            handler: async () => {
                await $(
                    [
                        "yarn",
                        "workspaces foreach",
                        `--exclude @ulthar/package-template`,
                        "run",
                        "build",
                    ],
                    {
                        pipeToStdout: true,
                    }
                );
            },
        },
        {
            name: "test",
            handler: async () => {
                await $(
                    [
                        "yarn",
                        "workspaces foreach",
                        `--exclude @ulthar/package-template`,
                        "run",
                        "test",
                    ],
                    {
                        pipeToStdout: true,
                    }
                );
            },
        },
    ],
}).run(process.argv);
