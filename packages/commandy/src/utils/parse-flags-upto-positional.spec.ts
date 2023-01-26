import { Flag } from "../flag";
import { parseFlagsUptoPositional } from "./parse-flags-upto-positional";

describe("ParseFlagsUptoPositional", () => {
    it("should correctly parse flags up to the first positional", () => {
        const [remainingArguments, flags] = parseFlagsUptoPositional(
            [
                "--banana",
                "-p",
                "--output=something",
                "not",
                "a",
                "flag",
                "--aFlag",
            ],
            [new Flag({ name: "p" })]
        );
        expect(flags).toEqual({
            p: true,
        });
        expect(remainingArguments).toEqual(["not", "a", "flag", "--aFlag"]);
    });
});
