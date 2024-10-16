import type { Fn } from "../types/fn.ts";
import {
  type TaggedVariant,
  type VariantFromTag,
  VariantTag,
} from "./variant.ts";

export type VariantMatcher<TVariant extends TaggedVariant<string>, T> = {
  [K in TVariant[VariantTag]]: Fn<VariantFromTag<TVariant, K>, T>;
};

export function match<const TVariant extends TaggedVariant<string>>(
  v: TVariant,
) {
  return {
    case<
      const TReturnType,
      const TMatcher extends VariantMatcher<
        TVariant,
        TReturnType
      > = VariantMatcher<TVariant, TReturnType>,
    >(cases: TMatcher): TReturnType {
      if (!(v[VariantTag] in cases)) {
        throw new Error("Non-exhaustive pattern match");
      }

      return cases[v[VariantTag] as TVariant[VariantTag]](
        v as Extract<TVariant, { [VariantTag]: TVariant[VariantTag] }>,
      );
    },
  };
}
