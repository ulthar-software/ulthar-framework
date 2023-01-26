import { ParsedConfig } from "./parsed-config";
import { PackageTemplate } from "./package-template";
import { JSONFile } from "@ulthar/filey";
import { join } from "path";
import { Config, getDefaultConfig } from "./config";
import { resolveRootDir } from "./resolve-root-dir";

export async function loadConfig(): Promise<ParsedConfig> {
    const rootDir = await resolveRootDir();
    const configFile = new JSONFile<Config>(join(rootDir, "ulthar.json"));

    const config = await configFile.readWithDefaultValue(
        await getDefaultConfig(rootDir),
        { writeIfMissing: true }
    );

    return {
        TEMPLATES: Object.keys(config.templates).reduce(
            (acc, key) => ({
                ...acc,
                [key]: new PackageTemplate(config?.templates[key]),
            }),
            {}
        ),
    };
}
