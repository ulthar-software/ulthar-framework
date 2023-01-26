import { exec } from "node:child_process";

export interface ShellOptions {
    pipeToStdout?: boolean;
    streamToPipe?: NodeJS.WriteStream;
}

export async function shell(command: string[], opts: ShellOptions = {}) {
    const pipeToStdout = opts.pipeToStdout ?? false;
    const streamToPipe = opts.streamToPipe ?? process.stdout;
    try {
        await (() => {
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
        })();
    } catch {}
}

export const $ = shell;
