import { shell } from "./shell";

describe("shell", () => {
    it("should call a shell command and resolve with its output when it's done", async () => {
        const result = await shell(["ls"]);

        expect(result).toMatchSnapshot();
    });

    it("should reject with the error and the stderr", async () => {
        await expect(shell(["command-not-found"])).rejects.toMatchSnapshot();
    });
});
