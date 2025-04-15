import type { EventToType, Infer } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
} from "@fabric/core";
import { UserRoleValues } from "../security/user-role.js";

export const UserInviteModel = new AggregateModel("userInvites", {
  email: Field.email(),
  role: Field.enum({
    values: UserRoleValues,
  }),
  code: Field.string(),
});
export type UserInviteModel = typeof UserInviteModel;

export type UserInvite = Infer<UserInviteModel>;

export const UserInvitedEvent = new DomainEvent("UserInvited", {
  email: Field.email(),
  role: Field.enum({
    values: UserRoleValues,
  }),
  code: Field.string(),
});
export type UserInvitedEvent = EventToType<typeof UserInvitedEvent>;

export const UserInviteAcceptedEvent = new DomainEvent(
  "UserInviteAccepted",
  {},
);
export type UserInviteAcceptedEvent = EventToType<
  typeof UserInviteAcceptedEvent
>;

export const UserInviteEvents = [
  UserInvitedEvent,
  UserInviteAcceptedEvent,
] as const;

export const UserInviteStream = new EventStream(
  UserInviteModel.name,
  UserInviteEvents,
);

export const UserInviteProjector = new AggregateProjector(
  UserInviteModel.name,
  UserInviteModel,
  UserInviteEvents,
  {
    UserInvited: (event): UserInvite =>
      UserInviteModel.from(event, event.payload),
    UserInviteAccepted: (): null => null,
  },
);
