import path from "node:path";
import {
  FileSystemService,
  initDatabase,
  LogService,
  SearchService,
  TaskScheduler,
} from "@we-archive/core";
import { app } from "electron";

/**
 * 主进程服务容器
 */
class ServiceContainer {
  private static instance: ServiceContainer;

  public searchService!: SearchService;
  public fileSystemService!: FileSystemService;
  public taskScheduler!: TaskScheduler;
  public logService!: LogService;

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * 初始化所有服务
   */
  async initialize(): Promise<void> {
    // 数据目录
    const userDataPath = app.getPath("userData");
    const dbPath = path.join(userDataPath, "data", "wearchive.db");
    const logsPath = path.join(userDataPath, "logs");

    // 初始化数据库
    initDatabase(dbPath);

    // 初始化服务
    this.searchService = new SearchService();
    this.fileSystemService = new FileSystemService();
    this.taskScheduler = new TaskScheduler();
    this.logService = new LogService(logsPath);

    // 初始化 FTS5（jieba 分词器）
    await this.searchService.init();

    this.logService.info("Services initialized", "ServiceContainer", {
      dbPath,
      logsPath,
    });
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.logService.info("Destroying services", "ServiceContainer");
    this.logService.destroy();
  }
}

export const services = ServiceContainer.getInstance();
