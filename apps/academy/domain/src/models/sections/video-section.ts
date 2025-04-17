import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";
import {
  BaseSectionAddedEvent,
  BaseSectionFields,
  SectionOrderChangedEvent,
  SectionTitleChangedEvent,
} from "./section-base.js";

// Video Section Content Model
export const VideoSectionContentModel = {
  videoUrl: Field.url(),
  description: Field.string({
    isOptional: true,
  }),
  duration: Field.integer({
    isOptional: true,
    isUnsigned: true,
  }),
};

// Video Section Model
export const VideoSectionModel = new AggregateModel("videoSections", {
  ...BaseSectionFields,
  content: Field.embedded({
    subModel: VideoSectionContentModel,
  }),
});

export type VideoSectionModel = typeof VideoSectionModel;
export type VideoSection = Infer<VideoSectionModel>;

// Video Section Added Event
export const VideoSectionAddedEvent = new DomainEvent("VideoSectionAdded", {
  ...BaseSectionAddedEvent,
  content: Field.embedded({
    subModel: VideoSectionContentModel,
  }),
});

export type VideoSectionAddedEvent = EventToType<typeof VideoSectionAddedEvent>;

// Content-specific update events
export const VideoSectionContentChangedEvent = new DomainEvent(
  "VideoSectionContentChanged",
  {
    content: Field.embedded({
      subModel: VideoSectionContentModel,
    }),
    updatedBy: Field.uuid(),
  },
);

export type VideoSectionContentChangedEvent = EventToType<
  typeof VideoSectionContentChangedEvent
>;

// Event streams for video section
export const VideoSectionEvents = [
  VideoSectionAddedEvent,
  SectionTitleChangedEvent,
  VideoSectionContentChangedEvent,
  SectionOrderChangedEvent,
] as const;

export const VideoSectionStream = new EventStream(
  VideoSectionModel.name,
  VideoSectionEvents,
);

// Projector for video section
export const VideoSectionProjector = new AggregateProjector(
  VideoSectionStream.name,
  VideoSectionModel,
  VideoSectionEvents,
  {
    VideoSectionAdded: (event): VideoSection =>
      VideoSectionModel.from(event, {
        title: event.payload.title,
        unitId: event.payload.unitId,
        order: event.payload.order,
        createdBy: event.payload.createdBy,
        content: event.payload.content,
      }),
    SectionTitleChanged: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        title: event.payload.title,
      }),
    VideoSectionContentChanged: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        content: event.payload.content,
      }),
    SectionOrderChanged: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        order: event.payload.order,
      }),
  },
);
