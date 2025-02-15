import type { Email, UUID } from "@fabric/core";
import {
  AggregateModel,
  EventStream,
  Field,
  type DomainEvent,
  type ModelToType,
} from "@fabric/core";
import { UserType, UserTypeValues } from "../security/users.js";

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

export type UserRegisteredEvent = DomainEvent<
  "UserRegistered",
  {
    firstName: string;
    lastName: string;
    email: Email;
    hashedPassword: string;
  }
>;
export type UserRegisteredByInvitationEvent = DomainEvent<
  "UserRegisteredByInvitation",
  {
    firstName: string;
    lastName: string;
    email: Email;
    hashedPassword: string;
    role: UserType;
    invitedBy: UUID;
  }
>;

export type UserRoleChangedEvent = DomainEvent<
  "UserRoleChanged",
  {
    role: UserType;
    changedBy: UUID;
  }
>;

export type UserPasswordChangedEvent = DomainEvent<
  "UserPasswordChanged",
  {
    hashedPassword: string;
  }
>;

export type UserEvents = UserRegisteredEvent | UserRoleChangedEvent;

export const UserStream = new EventStream(
  UserModel,
  {
    createEvents: ["UserRegistered", "UserRegisteredByInvitation"],
    updateEvents: ["UserRoleChanged"],
    deleteEvents: [],
  },
  {
    create(event: UserRegisteredEvent | UserRegisteredByInvitationEvent): User {
      switch (event._tag) {
        case "UserRegistered":
          return {
            id: event.streamId,
            firstName: event.payload.firstName,
            lastName: event.payload.lastName,
            email: event.payload.email,
            hashedPassword: event.payload.hashedPassword,
            role: UserType.BASE_USER,
            createdAt: event.timestamp,
            updatedAt: event.timestamp,
            version: 1n,
          };
        case "UserRegisteredByInvitation":
          return {
            id: event.streamId,
            firstName: event.payload.firstName,
            lastName: event.payload.lastName,
            email: event.payload.email,
            hashedPassword: event.payload.hashedPassword,
            role: event.payload.role,
            createdAt: event.timestamp,
            updatedAt: event.timestamp,
            version: 1n,
          };
        default: {
          const exhaustiveCheck: never = event;
          return exhaustiveCheck;
        }
      }
    },
    update(event: UserRoleChangedEvent, model: User): User {
      return {
        ...model,
        role: event.payload.role,
        updatedAt: event.timestamp,
        version: model.version + 1n,
      };
    },
  },
);
