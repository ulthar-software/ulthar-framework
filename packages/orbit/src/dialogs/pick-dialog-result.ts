import { DialogResult } from "./dialog-result.js";

export interface PickDialogResult {
    status: DialogResult;
    path?: string;
}
