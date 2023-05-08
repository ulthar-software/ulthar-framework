import { IpcMainInvokeEvent } from "electron";
import { TextFile, JSONFile, IFile } from "@ulthar/filey";
import { OpenFileDialogOptions } from "../dialogs/dialog-options.js";
import { DialogResult } from "../dialogs/dialog-result.js";
import { showPickFileDialog } from "../dialogs/pick-file-dialog.js";

export interface OpenFileEventHandlerResult {
    path?: string;
    data: string | Record<string, any>;
}

export async function openFileEventHandler(
    event: IpcMainInvokeEvent,
    options: OpenFileDialogOptions
) {
    const result = await showPickFileDialog(options);
    if (result.status == DialogResult.CANCELLED) {
        return { path: undefined, data: undefined };
    }

    let file: IFile<any> = new (options.parseJSON ? JSONFile : TextFile)(
        result.path!,
        { encoding: options.encoding }
    );

    const fileData = await file.read();

    return {
        path: result.path,
        data: fileData,
    };
}
