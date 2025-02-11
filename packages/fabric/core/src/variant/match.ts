/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Fn } from "../types/fn.js";
import {
  type TaggedVariant,
  type VariantFromTag,
  VariantTag,
} from "./variant.js";

export type VariantMatcher<TVariant extends TaggedVariant<string>, T> = {
  [K in TVariant[VariantTag]]: Fn<VariantFromTag<TVariant, K>, T>;
};

export function match<const TVariant extends TaggedVariant<string>>(
  v: TVariant,
) {
  return {
    case<const TMatcher extends VariantMatcher<TVariant, any>>(
      cases: TMatcher,
    ): ReturnType<TMatcher[keyof TMatcher]> {
      if (!(v[VariantTag] in cases)) {
        throw new Error("Non-exhaustive pattern match");
      }

      return cases[v[VariantTag] as TVariant[VariantTag]](
        v as Extract<TVariant, { [VariantTag]: TVariant[VariantTag] }>,
      );
    },
  };
}
