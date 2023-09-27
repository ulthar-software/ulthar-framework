export type TaggedString<Tag extends string> = string & { readonly _tag: Tag };

export type UUID = TaggedString<"UUID">;

export function tagString<Tag extends string>(string: string, tag: Tag) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    return Object.assign(string, {
        _tag: tag,
    }) as TaggedString<Tag>;
}

const a = tagString("a", "someTag");
const b = tagString("a", "someTag");

console.log(a === b);
console.log(a.localeCompare(b));
console.log(a);
console.log("a");
console.log(a._tag);
console.log(a.length);
console.log(a + "b");
