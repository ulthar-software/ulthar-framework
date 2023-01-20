import { $ } from "@ulthar/shelly";

export const YARN = {
    async addWorkspacePackage(packageName: string) {
        await $([`yarn`, `packages/${packageName}`, `init`]);
    },
    async addPackages(packages: string[]) {
        await $(["yarn", "add", ...packages], { pipeToStdout: true });
    },
    async update() {
        await $([`yarn`, `install`]);
    },
    async run(cmd: string[]) {
        await $(["yarn", ...cmd], {
            pipeToStdout: true,
        });
    },
    async workspacesRun(cmd: string[]) {
        await $(
            [
                "yarn",
                "workspaces foreach",
                `--exclude @ulthar/package-template`,
                `--exclude @ulthar/framework`,
                "-tpv",
                "run",
                ...cmd,
            ],
            {
                pipeToStdout: true,
            }
        );
    },
};
