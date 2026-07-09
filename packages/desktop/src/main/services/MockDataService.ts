import type {
  Account,
  BackupTask,
  Conversation,
  DataStats,
} from "../../shared/types";

/**
 * Mock 数据服务
 * 暂时用内存数据模拟，等 better-sqlite3 集成后替换
 */
const account: Account = {
  id: "1",
  wxid: "wxid_demo123456",
  nickname: "张三",
  avatar: undefined,
  lastBackupAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
  isAutoBackup: true,
  dataIntegrity: 98,
};

const conversations: Conversation[] = [
  {
    id: "1",
    accountId: "1",
    type: "personal",
    name: "李四",
    lastMessagePreview: "好的，明天见",
    lastMessageAt: new Date(Date.now() - 10 * 60 * 1000),
    messageCount: 1234,
    hasAttachments: true,
    backupStatus: "complete",
    isFavorite: false,
  },
  {
    id: "2",
    accountId: "1",
    type: "group",
    name: "项目讨论组",
    lastMessagePreview: "[图片] 王五: 这是最新设计稿",
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000),
    messageCount: 5678,
    hasAttachments: true,
    backupStatus: "complete",
    isFavorite: true,
  },
  {
    id: "3",
    accountId: "1",
    type: "personal",
    name: "赵六",
    lastMessagePreview: "收到",
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000),
    messageCount: 456,
    hasAttachments: false,
    backupStatus: "partial",
    isFavorite: false,
  },
];

const stats: DataStats = {
  conversationCount: 128,
  messageCount: 42816,
  attachmentCount: 3240,
  storageSize: 138046668800, // ~128.6GB
  todayNewCount: 156,
  pendingIssues: 2,
};

const tasks: BackupTask[] = [];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MockDataService = {
  /**
   * 获取当前账号
   */
  async getAccount(): Promise<Account> {
    await delay(100);
    return account;
  },

  /**
   * 获取数据统计
   */
  async getStats(): Promise<DataStats> {
    await delay(150);
    return stats;
  },

  /**
   * 获取会话列表
   */
  async getConversations(params: {
    offset: number;
    limit: number;
    search?: string;
  }): Promise<{ items: Conversation[]; total: number }> {
    await delay(200);

    let filtered = conversations;
    if (params.search) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(query));
    }

    const items = filtered.slice(params.offset, params.offset + params.limit);
    return { items, total: filtered.length };
  },

  /**
   * 获取备份任务列表
   */
  async getTasks(): Promise<BackupTask[]> {
    await delay(100);
    return tasks;
  },

  /**
   * 开始备份
   */
  async startBackup(): Promise<BackupTask> {
    await delay(300);

    const task: BackupTask = {
      id: Date.now().toString(),
      accountId: account.id,
      status: "scanning",
      progress: 0,
      currentStep: "正在查找聊天记录",
      startedAt: new Date(),
      elapsedTime: 0,
      savePath: "/Users/admin/Documents/WeArchive",
      errorCount: 0,
    };

    tasks.unshift(task);
    return task;
  },
};
