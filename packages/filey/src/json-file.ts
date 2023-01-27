import { Errors } from "./errors.js";
import { FileOptions } from "./file-options.js";
import { IFile } from "./file.js";
import { TextFile } from "./text-file";

export class JSONFile<T extends Record<string, any> = Record<string, any>>
    implements IFile<T>
{
    private file: TextFile;

    constructor(private filePath: string, opts?: FileOptions) {
        this.file = new TextFile(filePath, opts);
    }

    async readWithDefaultValue(
        defaultValue: T,
        opts: { writeIfMissing?: boolean } = {}
    ): Promise<T> {
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
        let contents: string = await this.file.read();

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
        await this.file.write(JSON.stringify(content, null, 4));
    }

    async delete(): Promise<void> {
        await this.file.delete();
    }

    async exists(): Promise<boolean> {
        return await this.file.exists();
    }
}
