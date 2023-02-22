export const PackageType = {
    DOMAIN: "DOMAIN",
    LIBRARY: "LIBRARY",
    APPLICATION: "APPLICATION",
} as const;

export type PackageType = "DOMAIN" | "LIBRARY" | "APPLICATION";
