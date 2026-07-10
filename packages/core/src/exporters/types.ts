export type ArchiveExportFormat = "html" | "csv" | "json";

export interface ArchiveExportConversation {
  id: string;
  name: string;
}

export interface ArchiveExportMessage {
  id: string;
  conversationId: string;
  senderName: string;
  type: string;
  content: string;
  timestamp: Date;
}

export interface ArchiveExportArtifactInput {
  targetDir: string;
  baseName: string;
  maskSensitive?: boolean;
  conversations: ArchiveExportConversation[];
  messages: ArchiveExportMessage[];
}

export interface ArchiveExportArtifactResult {
  format: ArchiveExportFormat;
  filePath: string;
  conversationCount: number;
  messageCount: number;
  attachmentCount: number;
}
