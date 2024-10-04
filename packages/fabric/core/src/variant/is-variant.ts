import { TaggedVariant, VariantTag } from "./variant.js";

export function isVariant<
  TVariant extends TaggedVariant<string>,
  TTag extends TVariant[VariantTag],
>(
  variant: TVariant,
  tag: TTag,
): variant is Extract<TVariant, { [VariantTag]: TTag }> {
  return variant[VariantTag] === tag;
}
