import { stat } from "fs/promises";

export async function isDirectory(filePath: string): Promise<boolean> {
    return (await stat(filePath)).isDirectory();
}
