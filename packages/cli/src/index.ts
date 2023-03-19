#!/usr/bin/env node

import { createCLI } from "@ulthar/commandy";
import { errors } from "./errors.js";
import { loadConfig } from "./utils/load-config.js";
import { YARN } from "./utils/yarn.js";

const { TEMPLATES } = await loadConfig();

createCLI({
    name: "cli",
    commands: [
        {
            name: "package",
            commands: [
                {
                    name: "new",
                    flags: [
                        { name: "type", type: "value", aliases: ["t"] },
                        {
                            name: "directory",
                            type: "value",
                            aliases: ["d"],
                        },
                    ],
                    args: [
                        {
                            name: "packageName",
                        },
                    ],
                    handler: async ({ packageName, type, directory }) => {
                        type = type ?? "lib";
                        const validTypes = Object.keys(TEMPLATES);
                        errors
                            .assert(validTypes.includes(type))
                            .orThrow("INVALID_TEMPLATE_TYPE", {
                                type,
                                validTypes,
                            });

                        await YARN.addWorkspacePackage(packageName, directory);
                        await TEMPLATES[type].applyTo(packageName, directory);
                        await YARN.update();
                    },
                },
            ],
        },
        {
            name: "template",
            commands: [
                {
                    name: "new",
                    args: [
                        {
                            name: "packageName",
                        },
                    ],
                    handler: async ({ packageName }) => {
                        await YARN.addWorkspacePackage(
                            packageName,
                            "templates"
                        );
                        await TEMPLATES["lib"].applyTo(
                            packageName,
                            "templates"
                        );
                        await YARN.update();
                    },
                },
            ],
        },
        {
            name: "build",
            args: [
                {
                    name: "packageName",
                    optional: true,
                },
            ],
            passExtraArgs: true,
            handler: async ({ extraArgs, packageName }) => {
                if (packageName) {
                    await YARN.packageRun(packageName, ["build", ...extraArgs]);
                } else {
                    await YARN.workspacesRun(["build", ...extraArgs]);
                }
            },
        },
        {
            name: "test",
            passExtraArgs: true,
            handler: async ({ extraArgs }) => {
                await YARN.run([
                    "jest",
                    "--verbose",
                    "--cache=false",
                    ...extraArgs,
                ]);
            },
        },
    ],
}).run(process.argv);
