import { Package } from "./package.js";
import { PackageType } from "./package-type.js";

export interface LocalPackage extends Package {
    packageDir: string;
    type: PackageType;
}
