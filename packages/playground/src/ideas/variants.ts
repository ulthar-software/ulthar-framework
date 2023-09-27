export type TaggedVariant<Payload = void, Tag extends string = string> = {
    readonly _tag: Tag;
} & Payload;

export type VariantConstructor<Payload = void, Tag extends string = string> = (
    p: Payload
) => TaggedVariant<Payload, Tag>;

export function createTaggedVariant<Payload, Tag extends string = string>(
    tag: Tag
): VariantConstructor<Payload, Tag> {
    return (p: Payload) => ({ _tag: tag, ...p });
}
