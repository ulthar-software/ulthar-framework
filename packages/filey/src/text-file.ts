import { isAbsolute } from "path";
import { readFile, rm, stat, writeFile } from "fs/promises";
import { Errors } from "./errors.js";
import { FileOptions } from "./file-options.js";
import { IFile } from "./file.js";

export class TextFile implements IFile<string> {
    protected encoding;

    constructor(protected filePath: string, opts?: FileOptions) {
        Errors.assert(isAbsolute(filePath)).orThrow("INVALID_RELATIVE_PATH", {
            path: filePath,
        });
        this.encoding = opts?.encoding ?? "utf-8";
    }

    async read(): Promise<string> {
        try {
            return await readFile(this.filePath, this.encoding);
        } catch {
            throw Errors.render("MISSING_FILE", { path: this.filePath });
        }
    }

    async write(content: string): Promise<void> {
        await writeFile(this.filePath, content, this.encoding);
    }

    async delete(): Promise<void> {
        try {
            await rm(this.filePath);
        } catch {}
    }

    async exists(): Promise<boolean> {
        try {
            await stat(this.filePath);
            return true;
        } catch {
            return false;
        }
    }
}
