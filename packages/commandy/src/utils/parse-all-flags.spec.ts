import { Flag } from "../flag";
import { parseAllFlags } from "./parse-all-flags";

describe("ParseAllFlags", () => {
    it("should parse all flags anywhere in an argv", () => {
        const [remainingArguments, flags] = parseAllFlags(
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
        expect(remainingArguments).toEqual(["not", "a", "flag"]);
    });
});
