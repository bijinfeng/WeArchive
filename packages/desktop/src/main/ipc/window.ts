import { BrowserWindow, ipcMain } from "../electron";

function getSenderWindow(
  event: Electron.IpcMainEvent,
): Electron.BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender);
}

export function registerWindowHandlers(): void {
  ipcMain.on("window:minimize", (event) => {
    getSenderWindow(event)?.minimize();
  });

  ipcMain.on("window:toggleMaximize", (event) => {
    const window = getSenderWindow(event);

    if (!window) return;

    if (window.isMaximized()) {
      window.unmaximize();
      return;
    }

    window.maximize();
  });

  ipcMain.on("window:close", (event) => {
    getSenderWindow(event)?.close();
  });
}
