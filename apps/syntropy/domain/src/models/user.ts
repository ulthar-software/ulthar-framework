import type { EventToType } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
  type ModelToType,
} from "@fabric/core";
import { UserTypeValues } from "../security/users.js";

export const UserModel = new AggregateModel("users", {
  firstName: Field.string(),
  lastName: Field.string(),
  email: Field.email(),
  hashedPassword: Field.string(),
  role: Field.enum({
    values: UserTypeValues,
  }),
});
export type UserModel = typeof UserModel;
export type User = ModelToType<UserModel>;

export const UserRegisteredEvent = new DomainEvent("UserRegistered", {
  firstName: Field.string(),
  lastName: Field.string(),
  email: Field.email(),
  hashedPassword: Field.string(),
});
type UserRegisteredEvent = EventToType<typeof UserRegisteredEvent>;

export const UserRegisteredByInvitationEvent = new DomainEvent(
  "UserRegisteredByInvitation",
  {
    firstName: Field.string(),
    lastName: Field.string(),
    email: Field.email(),
    hashedPassword: Field.string(),
    role: Field.enum({
      values: UserTypeValues,
    }),
    invitedBy: Field.uuid(),
  },
);
type UserRegisteredByInvitationEvent = EventToType<
  typeof UserRegisteredByInvitationEvent
>;

export const UserRoleChangedEvent = new DomainEvent("UserRoleChanged", {
  role: Field.enum({
    values: UserTypeValues,
  }),
  changedBy: Field.uuid(),
});
type UserRoleChangedEvent = EventToType<typeof UserRoleChangedEvent>;

export const UserPasswordChangedEvent = new DomainEvent("UserPasswordChanged", {
  hashedPassword: Field.string(),
});
type UserPasswordChangedEvent = EventToType<typeof UserPasswordChangedEvent>;

export const UserEvents = [
  UserRegisteredEvent,
  UserRegisteredByInvitationEvent,
  UserRoleChangedEvent,
  UserPasswordChangedEvent,
] as const;

export const UserStream = new EventStream("users", UserEvents);

export const UserProjector = new AggregateProjector(
  UserStream.name,
  UserModel,
  UserEvents,
  {
    UserRegistered: (event: UserRegisteredEvent): User =>
      UserModel.from(event, {
        ...event.payload,
        role: "BASE_USER",
      }),
    UserRegisteredByInvitation: (
      event: UserRegisteredByInvitationEvent,
    ): User => UserModel.from(event, event.payload),
    UserRoleChanged: (event: UserRoleChangedEvent, user: User): User =>
      UserModel.update(user, event, {
        ...user,
        role: event.payload.role,
      }),
    UserPasswordChanged: (event: UserPasswordChangedEvent, user: User): User =>
      UserModel.update(user, event, {
        ...user,
        hashedPassword: event.payload.hashedPassword,
      }),
  },
);
