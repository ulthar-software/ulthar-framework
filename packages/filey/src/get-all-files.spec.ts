import { join } from "path";
import { Errors } from "./errors";
import { getAllFilesInDirectory } from "./get-all-files";

describe("Get all files", () => {
    it("should get all files under a directory", async () => {
        const result = await getAllFilesInDirectory(__dirname);

        expect(result).toMatchSnapshot();
    });
    it("should fail if path is not a directory", async () => {
        const file = join(__dirname, "index.ts");
        expect(async () => {
            const result = await getAllFilesInDirectory(file);
        }).rejects.toThrow(
            Errors.render("NOT_A_DIRECTORY", {
                path: file,
            })
        );
    });
});
