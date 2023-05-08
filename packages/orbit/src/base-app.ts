import {
    App as ElectronApp,
    app as electronApp,
    BrowserWindow,
    ipcMain,
    Menu,
} from "electron";
import { EVENTS } from "./electron-events.js";
import { openFileEventHandler } from "./handlers/open-file-event-handler.js";
import { pickDirectoryEventHandler } from "./handlers/pick-directory-event-handler.js";
import { pickFileEventHandler } from "./handlers/pick-file-event-handler.js";

export class BaseApp {
    protected electronApp: ElectronApp;
    protected mainWindow?: BrowserWindow;

    constructor(
        protected frontendPath: string,
        protected frontendPort?: number
    ) {
        this.electronApp = electronApp;

        this.electronApp.whenReady().then(() => {
            this.init();
            this.onInit();
        });
        this.electronApp.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                this.electronApp.quit();
            }
        });
        this.electronApp.on("will-quit", () => {
            this.onQuit();
        });
    }

    private init(): void {
        Menu.setApplicationMenu(null);
        this.mainWindow = this.createWindow(
            this.frontendPath,
            this.frontendPort
        );
        this.initBaseHandlers();
    }

    protected createWindow(filePath: string, devPort?: number): BrowserWindow {
        const window = new BrowserWindow({
            width: 800,
            height: 600,
            icon: "../assets/window-icon.ico",
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true,
            },
            show: true,
        });

        if (process.env.DEV) {
            window.loadURL(`http://localhost:${devPort}`);
            window.webContents.openDevTools();
        } else {
            window.loadFile(filePath);
        }

        return window;
    }

    private initBaseHandlers(): void {
        ipcMain.handle(EVENTS.OPEN_FILE, openFileEventHandler);
        ipcMain.handle(EVENTS.PICK_DIRECTORY, pickDirectoryEventHandler);
        ipcMain.handle(EVENTS.PICK_FILE, pickFileEventHandler);
    }

    protected onQuit(): void {
        //subclass responsibility
    }
    protected onInit(): void {
        //subclass responsibility
    }
}
