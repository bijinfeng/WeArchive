import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createError, ErrorCode } from "../utils/errors";

/**
 * 文件系统服务
 */
export class FileSystemService {
  /**
   * 检查路径是否存在
   */
  exists(targetPath: string): boolean {
    try {
      fs.accessSync(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查路径是否可读
   */
  isReadable(targetPath: string): boolean {
    try {
      fs.accessSync(targetPath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查路径是否可写
   */
  isWritable(targetPath: string): boolean {
    try {
      fs.accessSync(targetPath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件大小
   */
  getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      throw createError(
        ErrorCode.FILE_READ_ERROR,
        `Cannot get file size: ${filePath}`,
        error,
      );
    }
  }

  /**
   * 获取目录大小（递归）
   */
  getDirectorySize(dirPath: string): number {
    let totalSize = 0;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(fullPath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  /**
   * 获取磁盘可用空间
   */
  async getAvailableSpace(_targetPath: string): Promise<number> {
    // TODO: 使用 node-disk-info 或类似库
    // 这里先返回一个占位值
    return 1024 * 1024 * 1024 * 100; // 100GB
  }

  /**
   * 确保目录存在（递归创建）
   */
  ensureDir(dirPath: string): void {
    if (!this.exists(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * 计算文件 SHA256 校验和
   */
  calculateChecksum(filePath: string): string {
    const hash = crypto.createHash("sha256");
    const fileBuffer = fs.readFileSync(filePath);
    hash.update(fileBuffer);
    return hash.digest("hex");
  }

  /**
   * 复制文件
   */
  copyFile(src: string, dest: string): void {
    try {
      // 确保目标目录存在
      this.ensureDir(path.dirname(dest));
      fs.copyFileSync(src, dest);
    } catch (error) {
      throw createError(
        ErrorCode.FILE_WRITE_ERROR,
        `Cannot copy file: ${src} -> ${dest}`,
        error,
      );
    }
  }

  /**
   * 移动文件
   */
  moveFile(src: string, dest: string): void {
    try {
      this.ensureDir(path.dirname(dest));
      fs.renameSync(src, dest);
    } catch (error) {
      throw createError(
        ErrorCode.FILE_WRITE_ERROR,
        `Cannot move file: ${src} -> ${dest}`,
        error,
      );
    }
  }

  /**
   * 删除文件
   */
  deleteFile(filePath: string): void {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      throw createError(
        ErrorCode.FILE_WRITE_ERROR,
        `Cannot delete file: ${filePath}`,
        error,
      );
    }
  }

  /**
   * 删除目录（递归）
   */
  deleteDirectory(dirPath: string): void {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (error) {
      throw createError(
        ErrorCode.FILE_WRITE_ERROR,
        `Cannot delete directory: ${dirPath}`,
        error,
      );
    }
  }

  /**
   * 列出目录内容
   */
  listDirectory(dirPath: string): Array<{
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    modifiedAt: Date;
  }> {
    try {
      const items = fs.readdirSync(dirPath);
      return items.map((name) => {
        const fullPath = path.join(dirPath, name);
        const stats = fs.statSync(fullPath);
        return {
          name,
          path: fullPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modifiedAt: stats.mtime,
        };
      });
    } catch (error) {
      throw createError(
        ErrorCode.FILE_READ_ERROR,
        `Cannot list directory: ${dirPath}`,
        error,
      );
    }
  }

  /**
   * 生成附件存储路径（按年月分目录 + SHA256 命名）
   */
  generateAttachmentPath(
    baseDir: string,
    checksum: string,
    extension: string,
  ): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const dir = path.join(baseDir, "attachments", String(year), month);
    this.ensureDir(dir);

    return path.join(dir, `${checksum}${extension}`);
  }
}
