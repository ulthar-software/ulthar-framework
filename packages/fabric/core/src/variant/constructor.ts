import type { TaggedVariant, VariantTag } from "./variant.js";

export function variantConstructor<const T extends TaggedVariant<string>>(
  tag: T[VariantTag],
) {
  function createVariant(): T;
  function createVariant<TOpts extends Omit<T, VariantTag>>(
    options: TOpts,
  ): T & TOpts;
  function createVariant<TOpts extends Omit<T, VariantTag>>(
    options?: TOpts,
  ): T & TOpts {
    return {
      _tag: tag,
      ...options,
    } as const as T & TOpts;
  }

  return createVariant;
}
