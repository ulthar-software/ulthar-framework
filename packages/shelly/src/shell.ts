import { exec } from "node:child_process";

export interface ShellOptions {
    pipeToStdout?: boolean;
}

export function shell(command: string[], opts: ShellOptions = {}) {
    const pipeToStdout = opts.pipeToStdout ?? false;
    return new Promise<string>((resolve, reject) => {
        const child = exec(command.join(" "), (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
        if (pipeToStdout) {
            child.stdout?.pipe(process.stdout);
            child.stderr?.pipe(process.stderr);
        }
    });
}

export const $ = shell;
