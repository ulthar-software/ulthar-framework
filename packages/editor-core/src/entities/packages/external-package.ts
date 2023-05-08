import { Package } from "./package.js";

export interface ExternalPackage extends Package {
    url: string;
}
