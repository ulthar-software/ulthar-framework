import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

export const EmailQueueStatus = {
  QUEUED: "QUEUED",
  SENT: "SENT",
  FAILED: "FAILED",
} as const;
export type EmailQueueStatus =
  (typeof EmailQueueStatus)[keyof typeof EmailQueueStatus];
export const EmailQueueStatusValues = Object.values(EmailQueueStatus);

export const EmailQueueModel = new AggregateModel("emailQueue", {
  eventId: Field.uuid(),
  eventType: Field.string(),
  recipient: Field.email(),
  subject: Field.string(),
  body: Field.string(),
  status: Field.enum({
    values: EmailQueueStatusValues,
  }),
  lastProcessedAt: Field.posixDate({ isOptional: true }),
});

export type EmailQueueModel = typeof EmailQueueModel;
export type EmailQueue = Infer<EmailQueueModel>;

export const EmailQueuedEvent = new DomainEvent("EmailQueued", {
  eventId: Field.uuid(),
  eventType: Field.string(),
  recipient: Field.email(),
  subject: Field.string(),
  body: Field.string(),
});
export type EmailQueuedEvent = EventToType<typeof EmailQueuedEvent>;

export const EmailSentEvent = new DomainEvent("EmailSent", {});
export type EmailSentEvent = EventToType<typeof EmailSentEvent>;

export const EmailFailedEvent = new DomainEvent("EmailFailed", {
  reason: Field.string(),
});
export type EmailFailedEvent = EventToType<typeof EmailFailedEvent>;

export const EmailQueueEvents = [
  EmailQueuedEvent,
  EmailSentEvent,
  EmailFailedEvent,
] as const;

export const EmailQueueStream = new EventStream(
  EmailQueueModel.name,
  EmailQueueEvents,
);

export const EmailQueueProjector = new AggregateProjector(
  EmailQueueStream.name,
  EmailQueueModel,
  EmailQueueEvents,
  {
    EmailQueued: (event): EmailQueue =>
      EmailQueueModel.from(event, {
        status: EmailQueueStatus.QUEUED,
        eventType: event.payload.eventType,
        eventId: event.payload.eventId,
        recipient: event.payload.recipient,
        subject: event.payload.subject,
        body: event.payload.body,
      }),
    EmailSent: (event, email): EmailQueue =>
      EmailQueueModel.update(email, event, {
        status: EmailQueueStatus.SENT,
        lastProcessedAt: event.timestamp,
      }),
    EmailFailed: (event, email): EmailQueue =>
      EmailQueueModel.update(email, event, {
        status: EmailQueueStatus.FAILED,
        lastProcessedAt: event.timestamp,
      }),
  },
);
