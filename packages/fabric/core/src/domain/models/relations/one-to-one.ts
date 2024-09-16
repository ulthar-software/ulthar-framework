import { TaggedVariant, VariantTag } from "../../../variant/variant.js";

export interface OneToOneRelationOptions<
  TOwner extends string,
  TTarget extends string,
> {
  /**
   * The owner of the relation.
   */
  owner: TOwner;

  /**
   * The target of the relation
   *
   */
  target: TTarget;
}

export interface OneToOneRelation<TOwner extends string, TTarget extends string>
  extends TaggedVariant<"ONE_TO_ONE_RELATION">,
    OneToOneRelationOptions<TOwner, TTarget> {}

export function createOneToOneRelation<
  TOwner extends string,
  TTarget extends string,
>(
  opts: OneToOneRelationOptions<TOwner, TTarget>,
): OneToOneRelation<TOwner, TTarget> {
  return {
    [VariantTag]: "ONE_TO_ONE_RELATION",
    ...opts,
  };
}
