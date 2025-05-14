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

export const UserViewModelProperties = [
  "id",
  "email",
  "firstName",
  "lastName",
  "role",
] as const satisfies (keyof User)[];

export type UserViewModelProperty = (typeof UserViewModelProperties)[number];
export type UserViewModel = Pick<User, UserViewModelProperty>;

export const UserCreatedEvent = new DomainEvent("UserCreated", {
  firstName: Field.string(),
  lastName: Field.string(),
  email: Field.email(),
  hashedPassword: Field.string(),
  role: Field.enum({
    values: UserRoleValues,
  }),
});
export type UserCreatedEvent = EventToType<typeof UserCreatedEvent>;

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
export type UserRegisteredByInvitationEvent = EventToType<
  typeof UserRegisteredByInvitationEvent
>;

export const UserRoleChangedEvent = new DomainEvent("UserRoleChanged", {
  role: Field.enum({
    values: UserRoleValues,
  }),
  changedBy: Field.uuid(),
});
export type UserRoleChangedEvent = EventToType<typeof UserRoleChangedEvent>;

export const UserPasswordChangedEvent = new DomainEvent("UserPasswordChanged", {
  hashedPassword: Field.string(),
});
export type UserPasswordChangedEvent = EventToType<
  typeof UserPasswordChangedEvent
>;

export const UserEvents = [
  UserRegisteredByInvitationEvent,
  UserRoleChangedEvent,
  UserPasswordChangedEvent,
  UserCreatedEvent,
] as const;

export const UserStream = new EventStream("users", UserEvents);

export const UserProjector = new AggregateProjector(
  UserStream.name,
  UserModel,
  UserEvents,
  {
    UserCreated: (e) => UserModel.from(e, e.payload),
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
