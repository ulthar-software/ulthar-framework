import { $ } from "@ulthar/shelly";
import { getAllFilesInDirectory } from "@ulthar/filey";
import { basename, join } from "path";

export class PackageTemplate {
    private templatePackageName: string;

    constructor(private templateDir: string) {
        this.templatePackageName = basename(templateDir);
    }

    async applyTo(packageName: string) {
        const packageWorkspaceDir = join("packages", packageName);

        await $(["cp", "-r", `${this.templateDir}/*`, packageWorkspaceDir]);

        const filesInTemplate = await getAllFilesInDirectory(this.templateDir);
        for (const file of filesInTemplate) {
            await $([
                "sed -i",
                `s/${this.templatePackageName}/${packageName}/g`,
                join(packageWorkspaceDir, file),
            ]);
        }
    }
}
