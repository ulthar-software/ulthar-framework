import type { Effect, StoreReadQuery } from "@fabric/core";
import {
  Field,
  isLike,
  Schema,
  UnexpectedError,
  type Infer,
} from "@fabric/core";
import type { Tag } from "../../models/tag.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export interface GetTagsDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

export const GetTagsInputModel = new Schema({
  filter: Field.string({ isOptional: true }),
  limit: Field.integer({ isOptional: true, minValue: 1, maxValue: 100 }),
});

export type GetTagsInput = Infer<typeof GetTagsInputModel>;

export interface GetTagsOutput {
  tags: Tag[];
}

export const GetTagsUseCase = new UseCase({
  name: "getTags",
  type: "query",
  auth: AccessPolicy.WithPermission(Permission.MANAGE_TAGS),
  inputSchema: GetTagsInputModel,
  effect: (
    { state }: GetTagsDependencies,
    { filter, limit }: GetTagsInput,
  ): Effect<GetTagsOutput, UnexpectedError> => {
    let tagsQuery = state.from("tags");

    if (filter) {
      tagsQuery = tagsQuery.where({
        name: isLike(`%${filter}%`),
      }) as StoreReadQuery<Tag>;
    }

    return tagsQuery
      .limit(limit ?? 10)
      .select()
      .map((tags) => ({ tags }))
      .mapError((e) => new UnexpectedError(e.message));
  },
});
