import { TaggedVariant, VariantTag } from "../variant/index.js";

/**
 * A TaggedError is a tagged variant with an error message.
 */
export class TaggedError<Tag extends string = string>
  extends Error
  implements TaggedVariant<Tag>
{
  readonly [VariantTag]: Tag;

  constructor(tag: Tag) {
    super();
    this[VariantTag] = tag;
  }
}
