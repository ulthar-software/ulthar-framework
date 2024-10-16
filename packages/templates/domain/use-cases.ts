import { UseCaseDefinition } from "@fabric/domain";

export const UseCases = [] as const satisfies UseCaseDefinition[];

export type UseCases = typeof UseCases;
