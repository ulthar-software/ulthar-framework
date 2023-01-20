import { readdir } from "fs/promises";
import { join } from "path";
import { Errors } from "./errors";
import { isDirectory } from "./is-directory";

export async function getAllFilesInDirectory(dirPath: string) {
    Errors.assert(await isDirectory(dirPath)).orThrow("NOT_A_DIRECTORY", {
        path: dirPath,
    });

    const files = await readdir(dirPath);
    const result: string[] = [];
    for (const file of files) {
        const fullFilePath = join(dirPath, file);
        if (await isDirectory(fullFilePath)) {
            result.push(
                ...(await getAllFilesInDirectory(fullFilePath)).map((f) =>
                    join(file, f)
                )
            );
        } else {
            result.push(file);
        }
    }
    return result;
}
