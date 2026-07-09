import { ipcMain } from "electron";
import { MockDataService } from "../services/MockDataService";

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers() {
  // Database API
  ipcMain.handle("database:getAccount", async () => {
    return await MockDataService.getAccount();
  });

  ipcMain.handle("database:getStats", async () => {
    return await MockDataService.getStats();
  });

  ipcMain.handle("database:getConversations", async (_event, params) => {
    return await MockDataService.getConversations(params);
  });

  // Backup API
  ipcMain.handle("backup:getTasks", async () => {
    return await MockDataService.getTasks();
  });

  ipcMain.handle("backup:start", async () => {
    return await MockDataService.startBackup();
  });

  // Settings API
  ipcMain.handle("settings:get", async (_event, _key: string) => {
    // TODO: 实现设置读取
    return null;
  });

  ipcMain.handle(
    "settings:set",
    async (_event, _key: string, _value: unknown) => {
      // TODO: 实现设置保存
      return true;
    },
  );
}
