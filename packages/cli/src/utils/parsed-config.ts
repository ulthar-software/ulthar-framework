import { PackageTemplate } from "./package-template";

export interface ParsedConfig {
    TEMPLATES: Record<string, PackageTemplate>;
}
