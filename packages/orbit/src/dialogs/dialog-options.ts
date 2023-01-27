export interface PickDirectoryDialogOptions {
    title: string;
    message: string;
    defaultPath?: string;
}

export interface PickFileDialogOptions extends PickDirectoryDialogOptions {
    extDescription: string;
    extensions: string[];
    defaultPath?: string;
}

export interface OpenFileDialogOptions extends PickFileDialogOptions {
    parseJSON?: boolean;
    encoding?: BufferEncoding;
}
