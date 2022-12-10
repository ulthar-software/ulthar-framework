import { exec, spawn } from "node:child_process";

export function shell(command: string) {
    return new Promise<string>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}
