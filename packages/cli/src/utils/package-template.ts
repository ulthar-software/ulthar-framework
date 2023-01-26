import { $ } from "@ulthar/shelly";
import { getAllFilesInDirectory } from "@ulthar/filey";
import { basename, join } from "path";

export class PackageTemplate {
    public templatePackageName: string;

    constructor(private templateDir: string) {
        this.templatePackageName = basename(templateDir);
    }

    async applyTo(packageName: string, packagesDir: string = "packages") {
        const packageWorkspaceDir = join(packagesDir, packageName);

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
