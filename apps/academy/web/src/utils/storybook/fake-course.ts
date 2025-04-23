import { PosixDate, type UUID } from "@fabric/core";
import { faker } from "@faker-js/faker";
import type { Course } from "@ulthar/academy-domain";

export function fakeCourse(course?: Partial<Course>): Course {
  return {
    id: course?.id ?? (faker.string.uuid() as UUID),
    title: course?.title ?? faker.lorem.words(3),
    description: course?.description ?? faker.lorem.paragraph(),
    createdAt: course?.createdAt ?? new PosixDate(faker.date.past().getTime()),
    createdBy: course?.createdBy ?? (faker.string.uuid() as UUID),
    updatedAt:
      course?.updatedAt ?? new PosixDate(faker.date.recent().getTime()),
    version: course?.version ?? BigInt(faker.number.int({ min: 1, max: 100 })),
  };
}
