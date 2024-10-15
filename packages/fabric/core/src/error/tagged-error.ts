import { TaggedVariant, VariantTag } from "../variant/index.js";

/**
 * A TaggedError is a tagged variant with an error message.
 */
export abstract class TaggedError<Tag extends string = string>
  extends Error
  implements TaggedVariant<Tag>
{
  readonly [VariantTag]: Tag;

  constructor(tag: Tag, message?: string) {
    super(message);
    this[VariantTag] = tag;
    this.name = tag;
  }
}
