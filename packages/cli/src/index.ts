#!/usr/bin/env node

import { createCLI } from "@ulthar/commandy";
import { errors } from "./errors";
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
                    flags: [{ type: "value", name: "type", aliases: ["t"] }],
                    args: [
                        {
                            name: "packageName",
                        },
                    ],
                    handler: async ({ packageName, type }) => {
                        type = type ?? "lib";
                        const validTypes = Object.keys(TEMPLATES);
                        errors
                            .assert(validTypes.includes(type))
                            .orThrow("INVALID_TEMPLATE_TYPE", {
                                type,
                                validTypes,
                            });

                        await YARN.addWorkspacePackage(packageName);
                        await TEMPLATES[type].applyTo(packageName);
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
