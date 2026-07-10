import { getSqlite } from "../database";
import type { Message, MessageListParams, MessageListResult } from "../types";

interface MessageRow {
  id: number;
  conversationId: number;
  stableId: string | null;
  messageId: string | null;
  senderWxid: string | null;
  senderName: string | null;
  type: Message["type"];
  content: string | null;
  timestamp: number;
  hasAttachment: number | null;
  rawPayload: string | null;
  sourceId: string | null;
  sourceHash: string | null;
  createdAt: number;
}

function mapMessage(row: MessageRow): Message {
  const message: Message = {
    id: String(row.id),
    conversationId: String(row.conversationId),
    type: row.type,
    timestamp: new Date(row.timestamp),
    hasAttachment: Boolean(row.hasAttachment),
    createdAt: new Date(row.createdAt),
  };

  if (row.messageId) {
    message.messageId = row.messageId;
  }
  if (row.senderWxid) {
    message.senderWxid = row.senderWxid;
  }
  if (row.senderName) {
    message.senderName = row.senderName;
  }
  if (row.content) {
    message.content = row.content;
  }
  if (row.stableId) {
    message.stableId = row.stableId;
  }
  if (row.rawPayload) {
    message.rawPayload = row.rawPayload;
  }
  if (row.sourceId) {
    message.sourceId = row.sourceId;
  }
  if (row.sourceHash) {
    message.sourceHash = row.sourceHash;
  }

  return message;
}

function resolveConversationId(conversationId: string | number): number {
  const row = getSqlite()
    .prepare(
      `
      SELECT id
      FROM conversations
      WHERE id = ? OR stable_id = ? OR conversation_id = ?
      LIMIT 1
    `,
    )
    .get(conversationId, String(conversationId), String(conversationId)) as
    | { id: number }
    | undefined;

  if (!row) {
    throw new Error(`Conversation ${conversationId} was not found`);
  }

  return row.id;
}

export async function listMessages(
  params: MessageListParams,
): Promise<MessageListResult> {
  const sqlite = getSqlite();
  const conversationId = resolveConversationId(params.conversationId);
  const limit = params.limit ?? 50;
  const offset = Number(params.cursor ?? 0);
  const conditions = ["conversation_id = ?"];
  const args: unknown[] = [conversationId];

  if (params.query) {
    conditions.push("(content LIKE ? OR sender_name LIKE ?)");
    args.push(`%${params.query}%`, `%${params.query}%`);
  }
  if (params.messageType) {
    conditions.push("type = ?");
    args.push(params.messageType);
  }

  const whereClause = conditions.join(" AND ");
  const total = sqlite
    .prepare(`SELECT COUNT(*) AS total FROM messages WHERE ${whereClause}`)
    .get(...args) as { total: number };
  const rows = sqlite
    .prepare(
      `
      SELECT
        id,
        conversation_id AS conversationId,
        stable_id AS stableId,
        message_id AS messageId,
        sender_wxid AS senderWxid,
        sender_name AS senderName,
        type,
        content,
        timestamp,
        has_attachment AS hasAttachment,
        raw_payload AS rawPayload,
        source_id AS sourceId,
        source_hash AS sourceHash,
        created_at AS createdAt
      FROM messages
      WHERE ${whereClause}
      ORDER BY timestamp ASC, id ASC
      LIMIT ? OFFSET ?
    `,
    )
    .all(...args, limit, offset) as MessageRow[];
  const nextOffset = offset + rows.length;

  return {
    items: rows.map(mapMessage),
    total: total.total,
    nextCursor: nextOffset < total.total ? String(nextOffset) : null,
  };
}
