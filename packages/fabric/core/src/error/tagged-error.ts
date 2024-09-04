import { TaggedVariant, VariantTag } from "../variant/index.js";

/**
 * Un TaggedError es un error que tiene un tag que lo identifica, lo cual
 * permite a los consumidores de la instancia de error identificar el tipo de
 * error que ocurrió.
 */
export class TaggedError<Tag extends string>
  extends Error
  implements TaggedVariant<Tag>
{
  readonly [VariantTag]: Tag;

  constructor(tag: Tag) {
    super();
    this[VariantTag] = tag;
  }
}
