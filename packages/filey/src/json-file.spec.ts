import { randomUUID } from "crypto";
import path from "path";
import { Errors } from "./errors";
import { JSONFile } from "./json-file";

describe("JSON File", () => {
    it("should fail with a relative file path", async () => {
        expect(() => {
            const file = new JSONFile<{ foo: string }>("tests/some-file.json");
        }).toThrow(
            Errors.render("INVALID_RELATIVE_PATH", {
                path: "tests/some-file.json",
            })
        );
    });

    it("should throw reading a missing file", async () => {
        const file = new JSONFile<{ foo: string }>(
            path.join(__dirname, "tests/some-missing-file.json")
        );
        expect(async () => {
            await file.read();
        }).rejects.toThrow(
            Errors.render("MISSING_FILE", {
                path: path.join(__dirname, "tests/some-missing-file.json"),
            })
        );
    });

    it("should throw reading an invalid json file", async () => {
        const file = new JSONFile<{ foo: string }>(
            path.join(__dirname, "tests/not-a-json-file.txt")
        );
        expect(async () => {
            await file.read();
        }).rejects.toThrow(
            Errors.render("INVALID_JSON", {
                path: path.join(__dirname, "tests/not-a-json-file.txt"),
                err: "Unexpected token t in JSON at position 2",
            })
        );
    });

    it("should correctly read a json file", async () => {
        const file = new JSONFile<{ foo: string }>(
            path.join(__dirname, "tests/some-file.json")
        );
        const data = await file.read();
        expect(data).toEqual({
            foo: "bar",
        });
    });

    it("should not throw reading a missing file", async () => {
        const file = new JSONFile<{ foo: string }>(
            path.join(__dirname, "tests/some-missing-file.json")
        );
        const result2 = await file.readWithDefaultValue({ foo: "baz" });
        expect(result2).toEqual({ foo: "baz" });
    });

    it("should write a file", async () => {
        const file = new JSONFile<{ foo: string }>(
            path.join(__dirname, "tests/some-file-to-write.json")
        );
        const content = {
            foo: randomUUID(),
        };
        await file.write(content);
        expect(await file.exists()).toBe(true);
        expect(await file.read()).toEqual(content);
    });

    it("should delete a file", async () => {
        const file = new JSONFile<{ foo: string }>(
            path.join(__dirname, "tests/some-file-to-delete.json")
        );
        await file.write({ foo: "to-delete" });
        await file.delete();
        expect(await file.exists()).toBe(false);
    });

    it("should not throw trying to delete a missing file", async () => {
        const file = new JSONFile<{ foo: string }>(
            path.join(__dirname, "tests/some-missing-file.json")
        );
        await file.delete();
        expect(await file.exists()).toBe(false);
    });

    it("should read and write the file if missing", async () => {
        const file = new JSONFile<{ foo: string }>(
            path.join(__dirname, "tests/some-not-yet-created-file.json")
        );
        await file.readWithDefaultValue(
            { foo: "bar" },
            {
                writeIfMissing: true,
            }
        );
        expect(await file.exists()).toBe(true);
        expect(await file.read()).toEqual({ foo: "bar" });
        await file.delete();
    });
});
