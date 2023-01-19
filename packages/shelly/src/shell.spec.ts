import { shell } from "./shell";

describe("shell", () => {
    let oldCwd: string;
    beforeAll(() => {
        oldCwd = process.cwd();
        process.chdir(__dirname + "/..");
    });
    afterAll(() => {
        process.chdir(oldCwd);
    });
    it("should call a shell command and resolve with its output when it's done", async () => {
        const result = await shell(["ls"]);
        expect(result).toMatchSnapshot();
    });

    it("should correctly pipe the stdout pipe", async () => {
        const stream = {
            on: jest.fn(),
            once: jest.fn(),
            emit: jest.fn(),
            write: jest.fn(),
            end: jest.fn(),
        };
        const result = await shell(["ls"], {
            pipeToStdout: true,
            streamToPipe: stream as any,
        });
        expect(stream.write).toHaveBeenCalledWith(`coverage
dist
jest.config.js
package.json
README.md
src
tsconfig.json
tsconfig.lib.json
`);
    });

    it("should reject with the error and the stderr", async () => {
        await expect(shell(["command-not-found"])).rejects.toMatchSnapshot();
    });
});
