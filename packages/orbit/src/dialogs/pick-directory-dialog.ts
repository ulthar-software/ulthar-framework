import { dialog } from "electron";
import { PickDirectoryDialogOptions } from "./dialog-options.js";
import { DialogResult } from "./dialog-result.js";
import { PickDialogResult } from "./pick-dialog-result.js";

export async function showPickDirectoryDialog(
    opts: PickDirectoryDialogOptions
): Promise<PickDialogResult> {
    const result = await dialog.showOpenDialog({
        title: opts.title,
        message: opts.message,
        defaultPath: opts.defaultPath,
        properties: ["openDirectory"],
    });
    return {
        status: result.canceled ? DialogResult.CANCELLED : DialogResult.SUCCESS,
        path: result.filePaths[0],
    };
}
