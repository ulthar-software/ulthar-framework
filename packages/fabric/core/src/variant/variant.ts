export const VariantTag = "_tag";
export type VariantTag = typeof VariantTag;

export interface TaggedVariant<TTag extends string> {
  readonly [VariantTag]: TTag;
}

export type VariantFromTag<
  TVariant extends TaggedVariant<string>,
  TTag extends TVariant[typeof VariantTag],
> = Extract<TVariant, { [VariantTag]: TTag }>;
