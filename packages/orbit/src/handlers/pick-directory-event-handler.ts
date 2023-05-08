import { IpcMainInvokeEvent } from "electron";
import { PickDirectoryDialogOptions } from "../dialogs/dialog-options.js";
import { showPickDirectoryDialog } from "../dialogs/pick-directory-dialog.js";

export async function pickDirectoryEventHandler(
    event: IpcMainInvokeEvent,
    options: PickDirectoryDialogOptions
) {
    const path = await showPickDirectoryDialog(options);
    return path;
}
