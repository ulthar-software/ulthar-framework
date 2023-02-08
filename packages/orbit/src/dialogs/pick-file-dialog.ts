import { dialog } from "electron";
import { PickFileDialogOptions } from "./dialog-options.js";
import { DialogResult } from "./dialog-result.js";
import { PickDialogResult } from "./pick-dialog-result.js";

export async function showPickFileDialog(
    opts: PickFileDialogOptions
): Promise<PickDialogResult> {
    const result = await dialog.showOpenDialog({
        filters: [
            {
                name: opts.extDescription,
                extensions: opts.extensions,
            },
        ],
        title: opts.title,
        message: opts.message,
        defaultPath: opts.defaultPath,
        properties: ["openFile"],
    });

    return {
        status: result.canceled ? DialogResult.CANCELLED : DialogResult.SUCCESS,
        path: result.filePaths[0],
    };
}
