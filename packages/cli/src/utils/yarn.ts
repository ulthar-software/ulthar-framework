import { $ } from "@ulthar/shelly";
import { loadConfig } from "./load-config";

export const YARN = {
    async addWorkspacePackage(
        packageName: string,
        packagesDir: string = "packages"
    ) {
        await $([`yarn`, `${packagesDir}/${packageName}`, `init`]);
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
        const { TEMPLATES } = await loadConfig();
        await $(
            [
                "yarn",
                "workspaces foreach",
                ...Object.keys(TEMPLATES).map(
                    (k) =>
                        `--exclude @ulthar/${TEMPLATES[k].templatePackageName}`
                ),
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
    async packageRun(packageName: string, cmd: string[]) {
        await $(["yarn", `packages/${packageName}`, ...cmd], {
            pipeToStdout: true,
        });
    },
};
