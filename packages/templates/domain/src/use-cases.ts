import { UseCaseDefinition } from "@ulthar/fabric-core";

export const UseCases = [] as const satisfies UseCaseDefinition[];

export type UseCases = typeof UseCases;
