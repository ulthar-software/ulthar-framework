export interface Config {
    templates: Record<string, string>;
}

export async function getDefaultConfig(rootDir: string): Promise<Config> {
    return {
        templates: {
            lib: "templates/lib-template",
        },
    };
}
