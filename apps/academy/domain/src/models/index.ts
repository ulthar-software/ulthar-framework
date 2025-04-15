import {
  UserInviteModel,
  UserInviteProjector,
  UserInviteStream,
} from "./user-invite.js";
import { UserModel, UserProjector, UserStream } from "./user.js";

export * from "./user.js";

export const DomainModels = [UserModel, UserInviteModel] as const;

export const DomainStreams = [UserStream, UserInviteStream] as const;

export const DomainProjectors = [UserProjector, UserInviteProjector] as const;
