import { BlameyError } from "./blamey-error";
import { ErrorContainer } from "./error-container";
import { ErrorTemplate } from "./error-template";
import { ErrorType } from "./error-type";

describe("Error Container", () => {
    const errorMap = {
        ["ERROR_1"]: new ErrorTemplate("Hello World"),
        ["ERROR_2"]: new ErrorTemplate(
            "Hello {{aThing}}!",
            ErrorType.USER_ERROR
        ),
    };

    it("should define a set of possible errors and throw them correctly", () => {
        const errors = new ErrorContainer(errorMap);

        try {
            errors.throw("ERROR_1");
        } catch (err: any) {
            expect(err).toBeInstanceOf(BlameyError);
            const blErr = err as BlameyError;
            expect(blErr.type).toBe(ErrorType.SYSTEM_ERROR);
        }
    });

    it("should assert values and throw accordingly", () => {
        const errors = new ErrorContainer(errorMap);

        expect(() => {
            errors.assert(true, "ERROR_1");
        }).not.toThrow();

        expect(() => {
            errors.assert(false, "ERROR_1");
        }).toThrow("Hello World");
    });

    it("should render message templates correctly", () => {
        const errors = new ErrorContainer(errorMap);

        expect(() => {
            errors.throw("ERROR_2", {
                aThing: "banana",
            });
        }).toThrow("Hello banana!");
    });

    it("should allow to check if an error is of certain type", () => {
        const errors = new ErrorContainer(errorMap);

        try {
            errors.throw("ERROR_2", {
                aThing: "banana",
            });
        } catch (err) {
            const blErr = err as BlameyError;
            expect(blErr.type).toBe(ErrorType.USER_ERROR);

            expect(errors.is(blErr, "ERROR_1")).toBe(false);
            expect(errors.is(blErr, "ERROR_2")).toBe(true);
        }
    });
});
