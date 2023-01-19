import { exec } from "node:child_process";

export interface ShellOptions {
    pipeToStdout?: boolean;
    streamToPipe?: NodeJS.WriteStream;
}

export function shell(command: string[], opts: ShellOptions = {}) {
    const pipeToStdout = opts.pipeToStdout ?? false;
    const streamToPipe = opts.streamToPipe ?? process.stdout;
    return new Promise<string>((resolve, reject) => {
        const parsedCommand = command.join(" ");
        const child = exec(
            parsedCommand,
            {
                env: {
                    ...process.env,
                    FORCE_COLOR: "1",
                },
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
}

export const $ = shell;
