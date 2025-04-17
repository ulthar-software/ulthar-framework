import type { EnumToType, EventToType } from "@fabric/core";
import { DomainEvent, Field } from "@fabric/core";

// Common fields that all section types share
export const BaseSectionFields = {
  title: Field.string(),
  unitId: Field.reference({
    targetModel: "units",
  }),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.reference({
    targetModel: "users",
  }),
};

// For compatibility with existing code, we'll keep the section type enum
export const SectionType = {
  TEXT: "TEXT",
  VIDEO: "VIDEO",
  QUESTIONNAIRE: "QUESTIONNAIRE",
} as const;

export const SectionTypeValues = Object.values(SectionType);
export type SectionType = EnumToType<typeof SectionType>;

// Base Section Added Event (holds common fields)
export const BaseSectionAddedEvent = {
  title: Field.string(),
  unitId: Field.uuid(),
  order: Field.integer({
    isUnsigned: true,
  }),
  createdBy: Field.uuid(),
};

// Common modification events that apply to all section types
export const SectionTitleChangedEvent = new DomainEvent("SectionTitleChanged", {
  title: Field.string(),
  updatedBy: Field.uuid(),
});

export type SectionTitleChangedEvent = EventToType<
  typeof SectionTitleChangedEvent
>;

export const SectionOrderChangedEvent = new DomainEvent("SectionOrderChanged", {
  order: Field.integer({
    isUnsigned: true,
  }),
  updatedBy: Field.uuid(),
});

export type SectionOrderChangedEvent = EventToType<
  typeof SectionOrderChangedEvent
>;
