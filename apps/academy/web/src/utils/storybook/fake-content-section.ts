import { PosixDate, type UUID } from "@fabric/core";
import { faker } from "@faker-js/faker";
import {
  SectionType,
  type TaggedVideoSection,
  type VideoSection,
  type VideoSectionContent,
} from "@ulthar/academy-domain";

export function fakeVideoContentSection(
  section?: Partial<VideoSection>,
): TaggedVideoSection {
  return {
    id: section?.id ?? (faker.string.uuid() as UUID),
    title: section?.title ?? faker.lorem.words(3),
    order: section?.order ?? faker.number.int({ min: 0, max: 100 }),
    unitId: section?.unitId ?? (faker.string.uuid() as UUID),
    version: section?.version ?? faker.number.int({ min: 0, max: 100 }),
    type: SectionType.VIDEO,
    content:
      section?.content ??
      ({
        videoUrl:
          "https://98c362bc-0a95-4de1-9606-b9b33c64a11f.mdnplay.dev/shared-assets/videos/flower.webm",
      } as VideoSectionContent),
    createdAt: section?.createdAt ?? new PosixDate(faker.date.past().getTime()),
    updatedAt:
      section?.updatedAt ?? new PosixDate(faker.date.recent().getTime()),
    createdBy: section?.createdBy ?? (faker.string.uuid() as UUID),
  };
}
