import { parseStringMarkdown } from "./parse-markdown";

describe("parseMarkdown", () => {
    it("should parse markdown", () => {
        const result = parseStringMarkdown(`Hello **world**!`);
        expect(JSON.stringify(result)).toEqual(
            JSON.stringify(["Hello ", <strong>world</strong>, "!"])
        );
    });
    it("should parse inner markdown", () => {
        const result = parseStringMarkdown(`Hello **world __blabla__**!`);
        expect(JSON.stringify(result)).toEqual(
            JSON.stringify([
                "Hello ",
                <strong>
                    world <em>blabla</em>
                </strong>,
                "!",
            ])
        );
    });
});
