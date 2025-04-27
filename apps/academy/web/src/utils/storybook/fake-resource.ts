import type { UUID } from "@fabric/core";
import { faker } from "@faker-js/faker";
import {
  ResourceTypeValues,
  type ResourceDetails,
} from "@ulthar/academy-domain";

export function fakeResource(
  resource?: Partial<ResourceDetails>,
): ResourceDetails {
  return {
    id: resource?.id ?? (faker.string.uuid() as UUID),
    title: resource?.title ?? faker.lorem.words(3),
    description: resource?.description ?? faker.lorem.paragraph(3),
    url: resource?.url ?? faker.internet.url(),
    type: resource?.type ?? faker.helpers.arrayElement(ResourceTypeValues),
  };
}
