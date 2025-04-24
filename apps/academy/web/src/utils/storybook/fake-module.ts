import { type UUID } from "@fabric/core";
import { faker } from "@faker-js/faker";
import type { ModuleSummary } from "@ulthar/academy-domain";
import { fakeUnitSummary } from "./fake-unit.ts";

export function fakeModuleSummary(
  module?: Partial<ModuleSummary>,
): ModuleSummary {
  return {
    id: module?.id ?? (faker.string.uuid() as UUID),
    title: module?.title ?? faker.lorem.words(3),
    units: module?.units ?? [
      fakeUnitSummary(),
      fakeUnitSummary(),
      fakeUnitSummary(),
    ],
  };
}
