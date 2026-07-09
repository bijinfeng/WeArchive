import { registerBackupHandlers } from "./backup";
import { registerDatabaseHandlers } from "./database";
import { registerFileHandlers } from "./file";
import { registerWindowHandlers } from "./window";

/**
 * 注册所有 IPC handlers
 */
export function registerIpcHandlers(): void {
  registerDatabaseHandlers();
  registerBackupHandlers();
  registerFileHandlers();
  registerWindowHandlers();
}
