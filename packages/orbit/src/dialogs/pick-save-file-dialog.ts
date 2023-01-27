import { dialog } from "electron";
import { DialogResult } from "./dialog-result";
import { PickDialogResult } from "./pick-dialog-result";

export async function showPickSaveFileDialog(
    name: string,
    extensions: string[]
): Promise<PickDialogResult> {
    const result = await dialog.showSaveDialog({
        title: name,
        filters: [{ name: name, extensions: extensions }],
    });
    return {
        status: result.canceled ? DialogResult.CANCELLED : DialogResult.SUCCESS,
        path: result.filePath,
    };
}
