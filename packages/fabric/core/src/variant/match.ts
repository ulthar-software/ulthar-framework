import { Fn } from "../types/fn.js";
import { TaggedVariant, VariantFromTag, VariantTag } from "./variant.js";

export type VariantMatcher<TVariant extends TaggedVariant<string>> = {
  [K in TVariant[VariantTag]]: Fn<VariantFromTag<TVariant, K>>;
};

export function match<const TVariant extends TaggedVariant<string>>(
  v: TVariant,
) {
  return {
    case<const TMatcher extends VariantMatcher<TVariant>>(
      cases: TMatcher,
    ): ReturnType<TMatcher[TVariant[VariantTag]]> {
      if (!(v[VariantTag] in cases)) {
        throw new Error("Non-exhaustive pattern match");
      }

      return cases[v[VariantTag] as TVariant[VariantTag]](
        v as Extract<TVariant, { [VariantTag]: TVariant[VariantTag] }>,
      );
    },
  };
}
