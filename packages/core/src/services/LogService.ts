import fs from "node:fs";
import path from "node:path";

/**
 * 日志级别
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * 日志条目
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

/**
 * 日志服务
 */
export class LogService {
  private logDir: string;
  private currentLogFile: string;
  private logBuffer: LogEntry[] = [];
  private flushTimer?: NodeJS.Timeout;
  private readonly bufferSize = 50; // 缓冲50条后写入
  private readonly flushInterval = 5000; // 5秒自动写入一次

  constructor(logDir: string) {
    this.logDir = logDir;
    this.currentLogFile = this.generateLogFileName();
    this.ensureLogDir();
    this.startFlushTimer();
  }

  /**
   * Debug 日志
   */
  debug(message: string, context?: string, data?: unknown): void {
    this.log("debug", message, context, data);
  }

  /**
   * Info 日志
   */
  info(message: string, context?: string, data?: unknown): void {
    this.log("info", message, context, data);
  }

  /**
   * Warning 日志
   */
  warn(message: string, context?: string, data?: unknown): void {
    this.log("warn", message, context, data);
  }

  /**
   * Error 日志
   */
  error(message: string, context?: string, data?: unknown): void {
    this.log("error", message, context, data);
    // 错误日志立即写入
    this.flush();
  }

  /**
   * 记录日志
   */
  private log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown,
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      ...(context && { context }),
      ...(data !== undefined && { data }),
    };

    this.logBuffer.push(entry);

    // 输出到控制台
    this.consoleLog(entry);

    // 缓冲区满时写入文件
    if (this.logBuffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * 控制台输出
   */
  private consoleLog(entry: LogEntry): void {
    const time = entry.timestamp.toISOString();
    const ctx = entry.context ? `[${entry.context}]` : "";
    const msg = `${time} ${entry.level.toUpperCase()} ${ctx} ${entry.message}`;

    switch (entry.level) {
      case "debug":
        console.debug(msg, entry.data);
        break;
      case "info":
        console.info(msg, entry.data);
        break;
      case "warn":
        console.warn(msg, entry.data);
        break;
      case "error":
        console.error(msg, entry.data);
        break;
    }
  }

  /**
   * 写入文件
   */
  flush(): void {
    if (this.logBuffer.length === 0) return;

    try {
      const lines = this.logBuffer.map((entry) => this.formatLogEntry(entry));
      const content = `${lines.join("\n")}\n`;

      fs.appendFileSync(
        path.join(this.logDir, this.currentLogFile),
        content,
        "utf-8",
      );

      this.logBuffer = [];
    } catch (error) {
      console.error("Failed to write log file:", error);
    }
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const context = entry.context ? `[${entry.context}]` : "";
    const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : "";

    return `${timestamp} ${level} ${context} ${entry.message}${dataStr}`;
  }

  /**
   * 生成日志文件名（按天）
   */
  private generateLogFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `app-${year}-${month}-${day}.log`;
  }

  /**
   * 确保日志目录存在
   */
  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * 启动定时写入
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Node.js 退出时写入
    process.on("exit", () => {
      this.flush();
    });
  }

  /**
   * 停止日志服务
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }

  /**
   * 读取日志文件
   */
  readLog(fileName?: string, maxLines = 1000): LogEntry[] {
    const file = fileName || this.currentLogFile;
    const filePath = path.join(this.logDir, file);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").filter(Boolean);

      // 只读取最后 N 行
      const lastLines = lines.slice(-maxLines);

      return lastLines
        .map((line) => this.parseLogLine(line))
        .filter(Boolean) as LogEntry[];
    } catch (error) {
      console.error("Failed to read log file:", error);
      return [];
    }
  }

  /**
   * 解析日志行
   */
  private parseLogLine(line: string): LogEntry | null {
    try {
      // 格式: 2025-01-19T10:30:00.000Z INFO [Context] Message {"data": ...}
      const match = line.match(
        /^(\S+)\s+(\S+)\s+(?:\[([^\]]+)\]\s+)?(.+?)(?:\s+(\{.+\}))?$/,
      );

      if (!match) return null;

      const [, timestampStr, levelStr, context, message, dataStr] = match;

      if (!timestampStr || !levelStr || !message) return null;

      const entry: LogEntry = {
        timestamp: new Date(timestampStr),
        level: levelStr.toLowerCase() as LogLevel,
        message,
      };

      if (context) {
        entry.context = context;
      }

      if (dataStr) {
        entry.data = JSON.parse(dataStr);
      }

      return entry;
    } catch {
      return null;
    }
  }

  /**
   * 列出所有日志文件
   */
  listLogFiles(): Array<{ name: string; size: number; modifiedAt: Date }> {
    try {
      const files = fs.readdirSync(this.logDir);
      return files
        .filter((name) => name.endsWith(".log"))
        .map((name) => {
          const filePath = path.join(this.logDir, name);
          const stats = fs.statSync(filePath);
          return {
            name,
            size: stats.size,
            modifiedAt: stats.mtime,
          };
        })
        .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());
    } catch (error) {
      console.error("Failed to list log files:", error);
      return [];
    }
  }

  /**
   * 清理旧日志（保留最近 N 天）
   */
  cleanOldLogs(keepDays = 30): number {
    try {
      const now = Date.now();
      const maxAge = keepDays * 24 * 60 * 60 * 1000;

      const files = this.listLogFiles();
      let deletedCount = 0;

      for (const file of files) {
        const age = now - file.modifiedAt.getTime();
        if (age > maxAge) {
          const filePath = path.join(this.logDir, file.name);
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error("Failed to clean old logs:", error);
      return 0;
    }
  }
}
