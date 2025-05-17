import type { StoreReadQuery, UUID } from "@fabric/core";
import {
  Effect,
  Field,
  isLike,
  isNotIn,
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

export const TypesWithTags = {
  UNIT: "UNIT",
  RESOURCE: "RESOURCE",
};
export type TypesWithTags = (typeof TypesWithTags)[keyof typeof TypesWithTags];
export const TypeWithTagsValues = Object.values(TypesWithTags);

export const GetTagsInputModel = new Schema({
  filter: Field.string({ isOptional: true }),
  limit: Field.integer({ isOptional: true }),
  idToFilter: Field.uuid({
    isOptional: true,
  }),
  typeToFilter: Field.enum({
    values: TypeWithTagsValues,
    isOptional: true,
  }),
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
    { filter, limit, idToFilter, typeToFilter }: GetTagsInput,
  ): Effect<GetTagsOutput, UnexpectedError> => {
    return Effect.fromGen(function* () {
      let tagsQuery = state.from("tags");

      if (filter || (idToFilter && typeToFilter)) {
        let tagsToFilter: UUID[] = [];
        if (typeToFilter === TypesWithTags.UNIT) {
          const unitTags = yield* state
            .from("unitTags")
            .where({
              unitId: idToFilter,
            })
            .select(["tagId"]);
          tagsToFilter = unitTags.map((tag) => tag.tagId);
        }

        if (typeToFilter === TypesWithTags.RESOURCE) {
          const resourceTags = yield* state
            .from("resourceTags")
            .where({
              resourceId: idToFilter,
            })
            .select(["tagId"]);
          tagsToFilter = [
            ...tagsToFilter,
            ...resourceTags.map((tag) => tag.tagId),
          ];
        }

        if (filter || tagsToFilter.length > 0) {
          tagsQuery = tagsQuery.where({
            ...(filter
              ? {
                  name: isLike(`%${filter}%`),
                }
              : {}),
            ...(tagsToFilter.length > 0
              ? {
                  id: isNotIn(tagsToFilter),
                }
              : {}),
          }) as StoreReadQuery<Tag>;
        }
      }

      const result = yield* tagsQuery
        .limit(limit ?? 10)
        .select()
        .map((tags) => ({ tags }))
        .tapError((e) => {
          console.error(e);
        })
        .mapError((e) => new UnexpectedError(e.message));

      return result;
    });
  },
});
