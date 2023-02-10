import { exec } from "node:child_process";
import { runSafeAsync } from "@ulthar/typey";
export interface ShellOptions {
    pipeToStdout?: boolean;
    streamToPipe?: NodeJS.WriteStream;
}

export type ShellCommand = (
    command: string[],
    opts?: ShellOptions
) => Promise<string>;

export const shell: ShellCommand = (
    command: string[],
    opts: ShellOptions = {}
) => {
    const pipeToStdout = opts.pipeToStdout ?? false;
    const streamToPipe = opts.streamToPipe ?? process.stdout;

    return new Promise<string>((resolve, reject) => {
        const parsedCommand = command.join(" ");
        const env = {
            ...process.env,
        };
        if (pipeToStdout) {
            env.FORCE_COLOR = "1";
        }
        const child = exec(
            parsedCommand,
            {
                env,
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            }
        );
        if (pipeToStdout) {
            child.stdout?.pipe(streamToPipe);
            child.stderr?.pipe(streamToPipe);
        }
    });
};

export const $ = shell;
export const $$ = async (command: string[], opts: ShellOptions = {}) =>
    await runSafeAsync(() => $(command, opts));
