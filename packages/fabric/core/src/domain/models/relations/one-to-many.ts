import { TaggedVariant, VariantTag } from "../../../variant/variant.js";

export interface OneToManyRelationOptions<
  TOwner extends string,
  TTarget extends string,
> {
  /**
   * The owner of the relation. In this case is the "one" side of the relation.
   */
  owner: TOwner;

  /**
   * The target of the relation. In this case is the "many" side of the relation.
   */
  target: TTarget;
}

export interface OneToManyRelation<
  TOwner extends string,
  TTarget extends string,
> extends TaggedVariant<"ONE_TO_MANY_RELATION">,
    OneToManyRelationOptions<TOwner, TTarget> {}

export function createOneToManyRelation<
  TOwner extends string,
  TTarget extends string,
>(
  opts: OneToManyRelationOptions<TOwner, TTarget>,
): OneToManyRelation<TOwner, TTarget> {
  return {
    [VariantTag]: "ONE_TO_MANY_RELATION",
    ...opts,
  };
}
