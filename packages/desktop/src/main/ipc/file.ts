import { dialog, ipcMain } from "electron";
import { services } from "../services";

/**
 * 注册文件系统相关的 IPC handlers
 */
export function registerFileHandlers(): void {
  /**
   * 选择文件
   */
  ipcMain.handle(
    "file:selectFile",
    async (
      _event,
      options?: {
        title?: string;
        filters?: Array<{ name: string; extensions: string[] }>;
      },
    ): Promise<string | null> => {
      try {
        const result = await dialog.showOpenDialog({
          title: options?.title || "选择文件",
          filters: options?.filters,
          properties: ["openFile"],
        });

        if (result.canceled || result.filePaths.length === 0) {
          return null;
        }

        return result.filePaths[0];
      } catch (error) {
        services.logService.error("Failed to select file", "IPC", error);
        throw error;
      }
    },
  );

  /**
   * 选择目录
   */
  ipcMain.handle(
    "file:selectDirectory",
    async (_event, title?: string): Promise<string | null> => {
      try {
        const result = await dialog.showOpenDialog({
          title: title || "选择文件夹",
          properties: ["openDirectory", "createDirectory"],
        });

        if (result.canceled || result.filePaths.length === 0) {
          return null;
        }

        return result.filePaths[0];
      } catch (error) {
        services.logService.error("Failed to select directory", "IPC", error);
        throw error;
      }
    },
  );

  /**
   * 检查路径是否可读
   */
  ipcMain.handle(
    "file:isReadable",
    async (_event, path: string): Promise<boolean> => {
      try {
        return services.fileSystemService.isReadable(path);
      } catch (error) {
        services.logService.error("Failed to check readable", "IPC", error);
        return false;
      }
    },
  );

  /**
   * 检查路径是否可写
   */
  ipcMain.handle(
    "file:isWritable",
    async (_event, path: string): Promise<boolean> => {
      try {
        return services.fileSystemService.isWritable(path);
      } catch (error) {
        services.logService.error("Failed to check writable", "IPC", error);
        return false;
      }
    },
  );

  /**
   * 获取文件大小
   */
  ipcMain.handle(
    "file:getSize",
    async (_event, path: string): Promise<number> => {
      try {
        return services.fileSystemService.getFileSize(path);
      } catch (error) {
        services.logService.error("Failed to get file size", "IPC", error);
        throw error;
      }
    },
  );

  /**
   * 获取目录大小
   */
  ipcMain.handle(
    "file:getDirectorySize",
    async (_event, path: string): Promise<number> => {
      try {
        return services.fileSystemService.getDirectorySize(path);
      } catch (error) {
        services.logService.error("Failed to get directory size", "IPC", error);
        throw error;
      }
    },
  );

  /**
   * 获取可用空间
   */
  ipcMain.handle(
    "file:getAvailableSpace",
    async (_event, path: string): Promise<number> => {
      try {
        return await services.fileSystemService.getAvailableSpace(path);
      } catch (error) {
        services.logService.error(
          "Failed to get available space",
          "IPC",
          error,
        );
        throw error;
      }
    },
  );

  services.logService.info("File IPC handlers registered", "IPC");
}
