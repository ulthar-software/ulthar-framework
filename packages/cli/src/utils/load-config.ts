import { ParsedConfig } from "./parsed-config";
import { PackageTemplate } from "./package-template";

export async function loadConfig(): Promise<ParsedConfig> {
    return {
        TEMPLATES: {
            lib: new PackageTemplate("templates/lib-template"),
        },
    };
}
