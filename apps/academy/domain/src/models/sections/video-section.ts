import type { EventToType, Infer, Schema } from "@fabric/core";
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
  SectionDeletedEvent,
  SectionOrderChangedEvent,
} from "./section-base.js";

// Video Section Content Model
export const VideoSectionContentModel = {
  videoUrl: Field.url(),
};

export type VideoSectionContent = Infer<
  Schema<typeof VideoSectionContentModel>
>;

// Video Section Model
export const VideoSectionModel = new AggregateModel("videoSections", {
  ...BaseSectionFields,
  title: Field.string(),
  content: Field.embedded(VideoSectionContentModel),
});

export type VideoSectionModel = typeof VideoSectionModel;
export type VideoSection = Infer<VideoSectionModel>;

// Video Section Added Event
export const VideoSectionAddedEvent = new DomainEvent("VideoSectionAdded", {
  ...BaseSectionAddedEvent,
  title: Field.string(),
  content: Field.embedded(VideoSectionContentModel),
});

export type VideoSectionAddedEvent = EventToType<typeof VideoSectionAddedEvent>;

// Content-specific update events
export const VideoSectionContentChangedEvent = new DomainEvent(
  "VideoSectionContentChanged",
  {
    title: Field.string(),
    content: Field.embedded(VideoSectionContentModel),
    updatedBy: Field.uuid(),
  },
);

export type VideoSectionContentChangedEvent = EventToType<
  typeof VideoSectionContentChangedEvent
>;

// Event streams for video section
export const VideoSectionEvents = [
  VideoSectionAddedEvent,
  VideoSectionContentChangedEvent,
  SectionOrderChangedEvent,
  SectionDeletedEvent,
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
    VideoSectionContentChanged: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        title: event.payload.title,
        content: event.payload.content,
      }),
    SectionOrderChanged: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        order: event.payload.order,
      }),
    SectionDeleted: (event, section): VideoSection =>
      VideoSectionModel.update(section, event, {
        deletedAt: event.timestamp,
      }),
  },
);
