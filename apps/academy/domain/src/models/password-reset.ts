import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";

export const PasswordResetRequestModel = new AggregateModel("passwordResets", {
  email: Field.email(),
  token: Field.string(),
  expiresAt: Field.posixDate(),
});
export type PasswordResetRequestModel = typeof PasswordResetRequestModel;
export type PasswordResetRequest = Infer<PasswordResetRequestModel>;

export const PasswordResetRequestedEvent = new DomainEvent(
  "PasswordResetRequested",
  {
    email: Field.email(),
    token: Field.string(),
    expiresAt: Field.posixDate(),
  },
);
export type PasswordResetRequestedEvent = EventToType<
  typeof PasswordResetRequestedEvent
>;
export const PasswordResetCompletedEvent = new DomainEvent(
  "PasswordResetCompleted",
  {},
);
export type PasswordResetCompletedEvent = EventToType<
  typeof PasswordResetCompletedEvent
>;

export const PasswordResetRequestExpiredEvent = new DomainEvent(
  "PasswordResetRequestExpired",
  {},
);
export type PasswordResetRequestExpiredEvent = EventToType<
  typeof PasswordResetRequestExpiredEvent
>;

export const PasswordResetRequestEvents = [
  PasswordResetRequestedEvent,
  PasswordResetCompletedEvent,
  PasswordResetRequestExpiredEvent,
] as const;

export const PasswordResetRequestStream = new EventStream(
  PasswordResetRequestModel.name,
  PasswordResetRequestEvents,
);

export const PasswordResetRequestProjector = new AggregateProjector(
  PasswordResetRequestModel.name,
  PasswordResetRequestModel,
  PasswordResetRequestEvents,
  {
    PasswordResetRequested: (
      event: PasswordResetRequestedEvent,
    ): PasswordResetRequest =>
      PasswordResetRequestModel.from(event, {
        email: event.payload.email,
        token: event.payload.token,
        expiresAt: event.payload.expiresAt,
      }),
    PasswordResetCompleted: (): null => null,
    PasswordResetRequestExpired: (): null => null,
  },
);
