import { PosixDate, type UUID } from "@fabric/core";
import { faker } from "@faker-js/faker";
import type {
  GetUnitWithSectionsOutput,
  TaggedContentSection,
  Unit,
} from "@ulthar/academy-domain";
import { fakeVideoContentSection } from "./fake-content-section.ts";

export function fakeUnitSummary(unit?: Partial<Unit>): Unit {
  return {
    id: unit?.id ?? (faker.string.uuid() as UUID),
    title: unit?.title ?? faker.lorem.words(3),
    moduleId: unit?.moduleId ?? (faker.string.uuid() as UUID),
    order: unit?.order ?? faker.number.int({ min: 0, max: 100 }),
    createdAt: unit?.createdAt ?? new PosixDate(faker.date.past().getTime()),
    createdBy: unit?.createdBy ?? (faker.string.uuid() as UUID),
    updatedAt: unit?.updatedAt ?? new PosixDate(faker.date.recent().getTime()),
    version: unit?.version ?? faker.number.int({ min: 1, max: 100 }),
  };
}

export function fakeUnitWithSections(
  unit?: Partial<Unit>,
  sections?: TaggedContentSection[],
): GetUnitWithSectionsOutput {
  return {
    unit: fakeUnitSummary(unit),
    sections: sections ?? [
      fakeVideoContentSection(),
      fakeVideoContentSection(),
      fakeVideoContentSection(),
    ],
  };
}
