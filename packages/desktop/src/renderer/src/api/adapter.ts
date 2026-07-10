import type { ApiAdapter } from "@we-archive/ui-shared/hooks";

/**
 * Electron IPC 适配器
 */
export const electronAdapter: ApiAdapter = {
  overview: {
    getData: () => window.electron.overview.getData(),
    seedFixture: () => window.electron.overview.seedFixture(),
  },
  conversations: {
    list: (params) => window.electron.conversations.list(params),
    getDetail: (conversationId) =>
      window.electron.conversations.getDetail(conversationId),
  },
  messages: {
    list: (params) => window.electron.messages.list(params),
  },
  tasks: {
    list: () => window.electron.tasks.list(),
    create: (input) => window.electron.tasks.create(input),
    start: (taskId) => window.electron.tasks.start(taskId),
    pause: (taskId) => window.electron.tasks.pause(taskId),
    resume: (taskId) => window.electron.tasks.resume(taskId),
    cancel: (taskId) => window.electron.tasks.cancel(taskId),
    retry: (taskId) => window.electron.tasks.retry(taskId),
    getDetail: (taskId) => window.electron.tasks.getDetail(taskId),
    listLogs: (params) => window.electron.tasks.listLogs(params),
  },
  transfer: {
    planImport: (input) => window.electron.transfer.planImport(input),
    planExport: (input) => window.electron.transfer.planExport(input),
    executeImport: (input) => window.electron.transfer.executeImport(input),
    executeExport: (input) => window.electron.transfer.executeExport(input),
  },
  settings: {
    get: (key) => window.electron.settings.get(key),
    set: (key, value) => window.electron.settings.set(key, value),
  },
  restore: {
    listPoints: () => window.electron.restore.listPoints(),
    checkPoint: (restorePointId) =>
      window.electron.restore.checkPoint(restorePointId),
    previewStrategy: (input) => window.electron.restore.previewStrategy(input),
    execute: (input) => window.electron.restore.execute(input),
  },
  file: {
    selectFile: (options) => window.electron.file.selectFile(options),
    selectDirectory: (title) => window.electron.file.selectDirectory(title),
    isReadable: (path) => window.electron.file.isReadable(path),
    isWritable: (path) => window.electron.file.isWritable(path),
    getSize: (path) => window.electron.file.getSize(path),
    getDirectorySize: (path) => window.electron.file.getDirectorySize(path),
    getAvailableSpace: (path) => window.electron.file.getAvailableSpace(path),
  },
};
