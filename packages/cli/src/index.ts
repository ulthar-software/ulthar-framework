#!/usr/bin/env node

import { createCLI } from "@ulthar/commandy";
import { shell } from "@ulthar/shelly";

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
                await shell(`yarn packages/${packageName} init`);
                await shell(
                    `cp packages/package-template/* packages/${packageName} -r`
                );
                await shell(
                    `sed -i "s/package-template/${packageName}/g" packages/${packageName}/README.md`
                );
                await shell(
                    `sed -i "s/package-template/${packageName}/g" packages/${packageName}/package.json`
                );
                await shell(`yarn install`);
            },
        },
    ],
}).run(process.argv);
