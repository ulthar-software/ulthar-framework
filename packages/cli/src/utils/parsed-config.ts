import { PackageTemplate } from "./package-template.js";

export interface ParsedConfig {
    TEMPLATES: Record<string, PackageTemplate>;
}
