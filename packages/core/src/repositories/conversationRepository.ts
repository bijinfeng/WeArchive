import { getSqlite } from "../database";
import type {
  Conversation,
  ConversationDetail,
  ConversationListParams,
  ConversationListResult,
  WeArchiveIssue,
} from "../types";

interface ConversationRow {
  id: number;
  accountId: number;
  conversationId: string;
  type: Conversation["type"];
  name: string;
  avatar: string | null;
  memberCount: number | null;
  messageCount: number | null;
  lastMessagePreview: string | null;
  lastMessageAt: number | null;
  hasAttachments: number;
  backupStatus: Conversation["backupStatus"] | null;
  isFavorite: number | null;
  createdAt: number;
}

function mapConversation(row: ConversationRow): Conversation {
  const conversation: Conversation = {
    id: String(row.id),
    accountId: String(row.accountId),
    conversationId: row.conversationId,
    type: row.type,
    name: row.name,
    memberCount: row.memberCount ?? 1,
    messageCount: row.messageCount ?? 0,
    lastMessagePreview: row.lastMessagePreview ?? "",
    hasAttachments: Boolean(row.hasAttachments),
    backupStatus: row.backupStatus ?? "complete",
    isFavorite: Boolean(row.isFavorite),
    createdAt: new Date(row.createdAt),
  };

  if (row.avatar) {
    conversation.avatar = row.avatar;
  }
  if (row.lastMessageAt != null) {
    conversation.lastMessageAt = new Date(row.lastMessageAt);
  }

  return conversation;
}

function buildWhere(params: ConversationListParams): {
  whereClause: string;
  args: unknown[];
} {
  const conditions: string[] = [];
  const args: unknown[] = [];

  if (params.query) {
    conditions.push("(c.name LIKE ? OR c.conversation_id LIKE ?)");
    args.push(`%${params.query}%`, `%${params.query}%`);
  }
  if (params.type) {
    conditions.push("c.type = ?");
    args.push(params.type);
  }
  if (params.backupStatus) {
    conditions.push("c.backup_status = ?");
    args.push(params.backupStatus);
  }
  if (params.hasAttachments !== undefined) {
    conditions.push(
      params.hasAttachments
        ? "EXISTS (SELECT 1 FROM messages m JOIN attachments a ON a.message_id = m.id WHERE m.conversation_id = c.id)"
        : "NOT EXISTS (SELECT 1 FROM messages m JOIN attachments a ON a.message_id = m.id WHERE m.conversation_id = c.id)",
    );
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    args,
  };
}

function selectConversationSql(whereClause: string): string {
  return `
    SELECT
      c.id,
      c.account_id AS accountId,
      c.conversation_id AS conversationId,
      c.type,
      c.name,
      c.avatar,
      c.member_count AS memberCount,
      c.message_count AS messageCount,
      (
        SELECT m.content
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.timestamp DESC
        LIMIT 1
      ) AS lastMessagePreview,
      c.last_message_at AS lastMessageAt,
      EXISTS (
        SELECT 1
        FROM messages m
        JOIN attachments a ON a.message_id = m.id
        WHERE m.conversation_id = c.id
      ) AS hasAttachments,
      c.backup_status AS backupStatus,
      c.is_favorite AS isFavorite,
      c.created_at AS createdAt
    FROM conversations c
    ${whereClause}
  `;
}

export async function listConversations(
  params: ConversationListParams = {},
): Promise<ConversationListResult> {
  const sqlite = getSqlite();
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  const { whereClause, args } = buildWhere(params);
  const count = sqlite
    .prepare(
      `
      SELECT COUNT(*) AS total
      FROM conversations c
      ${whereClause}
    `,
    )
    .get(...args) as { total: number };
  const rows = sqlite
    .prepare(
      `
      ${selectConversationSql(whereClause)}
      ORDER BY c.last_message_at DESC, c.id DESC
      LIMIT ? OFFSET ?
    `,
    )
    .all(...args, limit, offset) as ConversationRow[];

  return {
    items: rows.map(mapConversation),
    total: count.total,
  };
}

async function findConversation(
  conversationId: string | number,
): Promise<Conversation | null> {
  const sqlite = getSqlite();
  const row = sqlite
    .prepare(
      `
      ${selectConversationSql(
        "WHERE c.id = ? OR c.stable_id = ? OR c.conversation_id = ?",
      )}
      LIMIT 1
    `,
    )
    .get(conversationId, String(conversationId), String(conversationId)) as
    | ConversationRow
    | undefined;

  return row ? mapConversation(row) : null;
}

function buildConversationRisks(conversation: Conversation): WeArchiveIssue[] {
  const sqlite = getSqlite();
  const risks: WeArchiveIssue[] = [];
  const unknownMessages = sqlite
    .prepare(
      "SELECT COUNT(*) AS total FROM messages WHERE conversation_id = ? AND type = 'unknown'",
    )
    .get(Number(conversation.id)) as { total: number };

  if (conversation.backupStatus === "partial") {
    risks.push({
      id: `conversation-${conversation.id}-partial`,
      severity: "warning",
      title: "会话备份不完整",
      description: "该会话存在未完整导入的数据，导出前建议查看详情。",
      source: "archive",
    });
  }

  if (unknownMessages.total > 0) {
    risks.push({
      id: `conversation-${conversation.id}-unknown`,
      severity: "warning",
      title: "包含未知消息",
      description: `${unknownMessages.total} 条消息将以占位内容展示。`,
      source: "message",
    });
  }

  return risks;
}

export async function getConversationDetail(
  conversationId: string | number,
): Promise<ConversationDetail> {
  const conversation = await findConversation(conversationId);

  if (!conversation) {
    throw new Error(`Conversation ${conversationId} was not found`);
  }

  return {
    conversation,
    risks: buildConversationRisks(conversation),
    canExport: conversation.messageCount > 0,
    canRebackup: conversation.backupStatus !== "complete",
  };
}
