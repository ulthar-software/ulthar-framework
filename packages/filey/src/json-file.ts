import { readFile, rm, stat, writeFile } from "fs/promises";
import path from "path";
import { Errors } from "./errors";

export class JSONFile<T extends Record<string, any> = Record<string, any>> {
    constructor(private filePath: string) {
        Errors.assert(path.isAbsolute(filePath)).orThrow(
            "INVALID_RELATIVE_PATH",
            {
                path: filePath,
            }
        );
    }

    async readWithDefaultValue(
        defaultValue: T,
        opts: { writeIfMissing?: boolean } = {}
    ): Promise<T | undefined> {
        let ensure = opts.writeIfMissing ?? false;
        try {
            return await this.read();
        } catch {
            if (ensure) {
                await this.write(defaultValue);
            }
        }
        return defaultValue;
    }

    async read(): Promise<T> {
        let contents: string;
        try {
            contents = await readFile(this.filePath, "utf-8");
        } catch {
            throw Errors.render("MISSING_FILE", { path: this.filePath });
        }
        try {
            return JSON.parse(contents);
        } catch (err: any) {
            throw Errors.render("INVALID_JSON", {
                path: this.filePath,
                err: err.message,
            });
        }
    }

    async write(content: T): Promise<void> {
        await writeFile(
            this.filePath,
            JSON.stringify(content, null, 4),
            "utf-8"
        );
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
