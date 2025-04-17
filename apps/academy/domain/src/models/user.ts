import type { EventToType } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
  type Infer,
} from "@fabric/core";
import { UserRoleValues } from "../security/user-role.js";

export const UserModel = new AggregateModel("users", {
  firstName: Field.string(),
  lastName: Field.string(),
  email: Field.email(),
  hashedPassword: Field.string(),
  role: Field.enum({
    values: UserRoleValues,
  }),
});
export type UserModel = typeof UserModel;
export type User = Infer<UserModel>;

export const UserRegisteredByInvitationEvent = new DomainEvent(
  "UserRegisteredByInvitation",
  {
    firstName: Field.string(),
    lastName: Field.string(),
    email: Field.email(),
    hashedPassword: Field.string(),
    role: Field.enum({
      values: UserRoleValues,
    }),
    invitedBy: Field.uuid(),
  },
);
type UserRegisteredByInvitationEvent = EventToType<
  typeof UserRegisteredByInvitationEvent
>;

export const UserRoleChangedEvent = new DomainEvent("UserRoleChanged", {
  role: Field.enum({
    values: UserRoleValues,
  }),
  changedBy: Field.uuid(),
});
type UserRoleChangedEvent = EventToType<typeof UserRoleChangedEvent>;

export const UserPasswordChangedEvent = new DomainEvent("UserPasswordChanged", {
  hashedPassword: Field.string(),
});
type UserPasswordChangedEvent = EventToType<typeof UserPasswordChangedEvent>;

export const UserEvents = [
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
    UserRegisteredByInvitation: (
      event: UserRegisteredByInvitationEvent,
    ): User => UserModel.from(event, event.payload),
    UserRoleChanged: (event: UserRoleChangedEvent, user: User): User =>
      UserModel.update(user, event, {
        role: event.payload.role,
      }),
    UserPasswordChanged: (event: UserPasswordChangedEvent, user: User): User =>
      UserModel.update(user, event, {
        hashedPassword: event.payload.hashedPassword,
      }),
  },
);
