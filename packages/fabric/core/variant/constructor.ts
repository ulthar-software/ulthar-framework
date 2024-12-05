import type { TaggedVariant, VariantTag } from "./variant.ts";

export function variantConstructor<
  const T extends TaggedVariant<string>,
>(
  tag: T[VariantTag],
) {
  return <TOpts extends Omit<T, VariantTag>>(options: TOpts) => {
    return {
      _tag: tag,
      ...options,
    } as const;
  };
}
