import { PaginationOptions, PaginatedResult } from "@ulthar/typey";
import { ExternalPackage } from "../entities/packages/external-package.js";
import { LocalPackage } from "../entities/packages/local-package.js";

export interface IPackageManager {
    /**
     * Creates a new local package in the specified packageDir, and a given template
     */
    createWorkspacePackage(
        packageDir: string,
        template?: string
    ): Promise<LocalPackage>;

    /**
     * Add a dependency to a specific package
     */
    addPackageDependencies(
        pkg: LocalPackage,
        dependencies: ExternalPackage[]
    ): Promise<void>;

    getLocalPackages(): Promise<LocalPackage[]>;

    /**
     * Runs a command in the workspace
     */
    workspaceRunCommand(cmd: string[]): Promise<void>;

    /**
     * Runs a command foreach package in the workspace
     */
    foreachRunCommand(cmd: string[]): Promise<void>;

    /**
     * Runs a command in a given package
     */
    packageRunCommand(pkg: LocalPackage, cmd: string[]): Promise<void>;

    /**
     * Search dependencies from whatever repository this package manager
     * uses and returns a paginated result.
     */
    searchDependencies(
        searchString: string,
        opts?: PaginationOptions
    ): Promise<PaginatedResult<ExternalPackage>>;

    /**
     * Is this  name a valid packageName for this Package Manager?
     */
    isValidPackageName(packageName: string): Promise<boolean>;

    /**
     * Get all local dependencies of this package
     */
    getLocalPackageDependencies(pkg: LocalPackage): Promise<LocalPackage[]>;

    /**
     * Get all external direct dependencies of this package
     */
    getExternalPackageDependencies(
        pkg: LocalPackage
    ): Promise<ExternalPackage[]>;

    /**
     * Get all external direct and indirect dependencies of this package
     */
    getExternalPackageFullDependencies(
        pkg: LocalPackage
    ): Promise<ExternalPackage[]>;
}
