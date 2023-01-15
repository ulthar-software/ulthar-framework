import { shell } from "./shell";

describe("shell", () => {
    it("should call a shell command and resolve with its output when it's done", async () => {
        const oldCwd = process.cwd();
        process.chdir(__dirname + "/..");

        const result = await shell(["ls"]);
        expect(result).toMatchSnapshot();

        process.chdir(oldCwd);
    });

    it("should reject with the error and the stderr", async () => {
        await expect(shell(["command-not-found"])).rejects.toMatchSnapshot();
    });
});
