export const VariantTag = "_tag";
export type VariantTag = typeof VariantTag;

export interface TaggedVariant<TTag extends string> {
  readonly [VariantTag]: TTag;
}

export type VariantFromTag<
  TVariant extends TaggedVariant<string>,
  TTag extends TVariant[typeof VariantTag],
> = Extract<TVariant, { [VariantTag]: TTag }>;

export namespace Variant {
  export function is<
    TVariant extends TaggedVariant<string>,
    TTag extends TVariant[VariantTag],
  >(
    variant: TVariant,
    tag: TTag,
  ): variant is Extract<TVariant, { [VariantTag]: TTag }> {
    return variant[VariantTag] === tag;
  }
}
