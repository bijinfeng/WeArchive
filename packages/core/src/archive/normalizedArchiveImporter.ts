import { getSqlite } from "../database";
import type {
  ImportNormalizedArchiveCounts,
  ImportNormalizedArchiveResult,
  NormalizedArchiveInput,
} from "./types";

interface IdRow {
  id: number;
}

function toTimestamp(value: Date | undefined): number | null {
  return value ? value.getTime() : null;
}

function toJson(value: unknown): string | null {
  return value == null ? null : JSON.stringify(value);
}

function requireRow(row: IdRow | undefined, label: string): IdRow {
  if (!row) {
    throw new Error(`${label} was not created`);
  }

  return row;
}

export async function importNormalizedArchive(
  input: NormalizedArchiveInput,
): Promise<ImportNormalizedArchiveResult> {
  const sqlite = getSqlite();

  const importArchive = sqlite.transaction(() => {
    const now = new Date();
    const counts: ImportNormalizedArchiveCounts = {
      accounts: 0,
      contacts: 0,
      conversations: 0,
      messages: 0,
      attachments: 0,
      duplicates: 0,
      warnings: input.warnings.length,
      unknownTypes: input.messages.filter(
        (message) => message.type === "unknown",
      ).length,
      taskLogs: 0,
    };

    const existingArchive = sqlite
      .prepare("SELECT id FROM archives WHERE archive_id = ?")
      .get(input.metadata.archiveId) as IdRow | undefined;

    if (existingArchive) {
      sqlite
        .prepare(
          `
          UPDATE archives
          SET name = ?, source_type = ?, source_version = ?, imported_at = ?
          WHERE id = ?
        `,
        )
        .run(
          input.metadata.name,
          input.metadata.sourceType,
          input.metadata.sourceVersion ?? null,
          now.getTime(),
          existingArchive.id,
        );
    } else {
      sqlite
        .prepare(
          `
          INSERT INTO archives (
            archive_id, name, source_type, source_version, imported_at, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        )
        .run(
          input.metadata.archiveId,
          input.metadata.name,
          input.metadata.sourceType,
          input.metadata.sourceVersion ?? null,
          now.getTime(),
          input.metadata.createdAt.getTime(),
        );
    }

    const archive = requireRow(
      sqlite
        .prepare("SELECT id FROM archives WHERE archive_id = ?")
        .get(input.metadata.archiveId) as IdRow | undefined,
      "Archive",
    );

    const importJobResult = sqlite
      .prepare(
        `
        INSERT INTO import_jobs (
          archive_id, status, source_type, source_path, warning_count,
          unknown_type_count, started_at, created_at
        )
        VALUES (?, 'running', ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(
        archive.id,
        input.metadata.sourceType,
        input.metadata.sourcePath ?? null,
        counts.warnings,
        counts.unknownTypes,
        now.getTime(),
        now.getTime(),
      );
    const importJobId = Number(importJobResult.lastInsertRowid);

    const accountIds = new Map<string, number>();
    const selectAccount = sqlite.prepare(
      "SELECT id FROM accounts WHERE wxid = ?",
    );
    const insertAccount = sqlite.prepare(`
      INSERT INTO accounts (
        wxid, nickname, avatar, device_source, last_backup_at, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(wxid) DO UPDATE SET
        nickname = excluded.nickname,
        avatar = excluded.avatar,
        device_source = excluded.device_source,
        last_backup_at = excluded.last_backup_at
    `);

    for (const account of input.accounts) {
      const before = selectAccount.get(account.wxid) as IdRow | undefined;
      insertAccount.run(
        account.wxid,
        account.nickname,
        account.avatar ?? null,
        account.deviceSource ?? null,
        toTimestamp(account.lastBackupAt),
        now.getTime(),
      );
      const row = requireRow(
        selectAccount.get(account.wxid) as IdRow | undefined,
        `Account ${account.wxid}`,
      );
      accountIds.set(account.wxid, row.id);

      if (!before) {
        counts.accounts += 1;
      }
    }

    const selectContact = sqlite.prepare(
      "SELECT id FROM contacts WHERE account_id = ? AND stable_id = ?",
    );
    const insertContact = sqlite.prepare(`
      INSERT INTO contacts (
        account_id, stable_id, wxid, nickname, avatar, type, remark,
        source_id, source_hash, raw_payload, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(account_id, stable_id) DO UPDATE SET
        wxid = excluded.wxid,
        nickname = excluded.nickname,
        avatar = excluded.avatar,
        type = excluded.type,
        remark = excluded.remark,
        source_id = excluded.source_id,
        source_hash = excluded.source_hash,
        raw_payload = excluded.raw_payload
    `);

    for (const contact of input.contacts) {
      const accountId = accountIds.get(contact.accountWxid);

      if (!accountId) {
        throw new Error(`Account ${contact.accountWxid} was not imported`);
      }

      insertContact.run(
        accountId,
        contact.stableId,
        contact.wxid,
        contact.nickname,
        contact.avatar ?? null,
        contact.type ?? "personal",
        contact.remark ?? null,
        contact.sourceId ?? null,
        contact.sourceHash ?? null,
        toJson(contact.rawPayload),
        now.getTime(),
      );
      const row = selectContact.get(accountId, contact.stableId) as
        | IdRow
        | undefined;

      if (!row) {
        throw new Error(`Contact ${contact.stableId} was not imported`);
      }

      counts.contacts += 1;
    }

    const conversationIds = new Map<string, number>();
    const selectConversation = sqlite.prepare(
      "SELECT id FROM conversations WHERE stable_id = ?",
    );
    const insertConversation = sqlite.prepare(`
      INSERT INTO conversations (
        account_id, conversation_id, stable_id, type, name, avatar, member_count,
        message_count, last_message_at, backup_status, is_favorite,
        source_id, source_hash, raw_payload, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(stable_id) DO UPDATE SET
        account_id = excluded.account_id,
        conversation_id = excluded.conversation_id,
        type = excluded.type,
        name = excluded.name,
        avatar = excluded.avatar,
        member_count = excluded.member_count,
        message_count = excluded.message_count,
        last_message_at = excluded.last_message_at,
        backup_status = excluded.backup_status,
        is_favorite = excluded.is_favorite,
        source_id = excluded.source_id,
        source_hash = excluded.source_hash,
        raw_payload = excluded.raw_payload
    `);

    for (const conversation of input.conversations) {
      const accountId = accountIds.get(conversation.accountWxid);

      if (!accountId) {
        throw new Error(`Account ${conversation.accountWxid} was not imported`);
      }

      const before = selectConversation.get(conversation.stableId) as
        | IdRow
        | undefined;
      insertConversation.run(
        accountId,
        conversation.conversationId,
        conversation.stableId,
        conversation.type,
        conversation.name,
        conversation.avatar ?? null,
        conversation.memberCount ?? 1,
        conversation.messageCount ?? 0,
        toTimestamp(conversation.lastMessageAt),
        conversation.backupStatus ?? "complete",
        conversation.isFavorite ? 1 : 0,
        conversation.sourceId ?? null,
        conversation.sourceHash ?? null,
        toJson(conversation.rawPayload),
        now.getTime(),
      );
      const row = requireRow(
        selectConversation.get(conversation.stableId) as IdRow | undefined,
        `Conversation ${conversation.stableId}`,
      );
      conversationIds.set(conversation.stableId, row.id);

      if (!before) {
        counts.conversations += 1;
      }
    }

    const messageIds = new Map<string, number>();
    const selectMessage = sqlite.prepare(
      "SELECT id FROM messages WHERE stable_id = ?",
    );
    const insertMessage = sqlite.prepare(`
      INSERT INTO messages (
        conversation_id, stable_id, message_id, sender_wxid, sender_name, type,
        content, timestamp, has_attachment, raw_payload, source_id, source_hash,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const message of input.messages) {
      const conversationId = conversationIds.get(message.conversationStableId);

      if (!conversationId) {
        throw new Error(
          `Conversation ${message.conversationStableId} was not imported`,
        );
      }

      const existingMessage = selectMessage.get(message.stableId) as
        | IdRow
        | undefined;

      if (existingMessage) {
        messageIds.set(message.stableId, existingMessage.id);
        counts.duplicates += 1;
        continue;
      }

      const result = insertMessage.run(
        conversationId,
        message.stableId,
        message.messageId ?? null,
        message.senderWxid ?? null,
        message.senderName ?? null,
        message.type,
        message.content ?? null,
        message.timestamp.getTime(),
        message.hasAttachment ? 1 : 0,
        toJson(message.rawPayload),
        message.sourceId ?? null,
        message.sourceHash ?? null,
        now.getTime(),
      );
      messageIds.set(message.stableId, Number(result.lastInsertRowid));
      counts.messages += 1;
    }

    const selectAttachment = sqlite.prepare(
      "SELECT id FROM attachments WHERE stable_id = ?",
    );
    const insertAttachment = sqlite.prepare(`
      INSERT INTO attachments (
        message_id, stable_id, type, filename, file_size, file_path, checksum,
        backup_status, source_id, source_hash, raw_payload, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(stable_id) DO UPDATE SET
        filename = excluded.filename,
        file_size = excluded.file_size,
        file_path = excluded.file_path,
        checksum = excluded.checksum,
        backup_status = excluded.backup_status,
        source_id = excluded.source_id,
        source_hash = excluded.source_hash,
        raw_payload = excluded.raw_payload
    `);

    for (const attachment of input.attachments) {
      const messageId = messageIds.get(attachment.messageStableId);

      if (!messageId) {
        throw new Error(
          `Message ${attachment.messageStableId} was not imported`,
        );
      }

      const before = selectAttachment.get(attachment.stableId) as
        | IdRow
        | undefined;
      insertAttachment.run(
        messageId,
        attachment.stableId,
        attachment.type,
        attachment.filename ?? null,
        attachment.fileSize ?? null,
        attachment.filePath ?? null,
        attachment.checksum ?? null,
        attachment.backupStatus ?? "complete",
        attachment.sourceId ?? null,
        attachment.sourceHash ?? null,
        toJson(attachment.rawPayload),
        now.getTime(),
      );

      if (!before) {
        counts.attachments += 1;
      }
    }

    const insertTaskLog = sqlite.prepare(`
      INSERT INTO task_logs (
        import_job_id, level, message, metadata_json, created_at
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const taskLog of input.taskLogs) {
      insertTaskLog.run(
        importJobId,
        taskLog.level,
        taskLog.message,
        toJson(taskLog.metadata),
        taskLog.createdAt.getTime(),
      );
      counts.taskLogs += 1;
    }

    sqlite
      .prepare(
        `
        UPDATE import_jobs
        SET status = 'completed',
          summary_json = ?,
          completed_at = ?
        WHERE id = ?
      `,
      )
      .run(JSON.stringify(counts), now.getTime(), importJobId);

    sqlite
      .prepare(
        `
        INSERT INTO restore_points (
          archive_id, name, status, summary_json, risk_json, checked_at, created_at
        )
        VALUES (?, ?, 'available', ?, ?, ?, ?)
      `,
      )
      .run(
        archive.id,
        `${input.metadata.name} 恢复点`,
        JSON.stringify(counts),
        JSON.stringify(input.warnings),
        now.getTime(),
        now.getTime(),
      );

    return {
      archiveId: archive.id,
      importJobId,
      counts,
      warnings: input.warnings,
    };
  });

  return importArchive();
}
