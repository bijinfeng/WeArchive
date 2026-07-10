import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Icon } from "@astryxdesign/core/Icon";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Switch } from "@astryxdesign/core/Switch";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { WeArchiveHomeData } from "@we-archive/core/types";
import { formatNumber } from "@we-archive/core/utils";
import { RefreshCw, UserRound } from "lucide-react";
import { useState } from "react";

import { DetailDrawer } from "../../wearchive-feedback";
import { getSearchTargetProps } from "../../wearchive-shell/searchTargets";
import { formatStorage } from "../../wearchive-shell/utils";
import { homeStyles, sx } from "./styles";

export interface AccountConsoleProps {
  data: WeArchiveHomeData;
  platformLabel: string;
  onBackupAction?: (() => void | Promise<void>) | undefined;
}

export function AccountConsole({
  data,
  platformLabel,
  onBackupAction,
}: AccountConsoleProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [drawer, setDrawer] = useState<"account" | "archive" | null>(null);
  const account = data.account;
  const accountName = account?.nickname ?? "等待导入微信账号";
  const avatarLabel = accountName.slice(0, 1).toUpperCase();

  const startScan = () => {
    setIsScanning(true);
    window.setTimeout(() => setIsScanning(false), 900);
  };

  return (
    <>
      <Card
        padding={0}
        role="region"
        aria-label="当前账号卡"
        className={sx(homeStyles.accountConsole)}
      >
        <VStack gap={5} className={sx(homeStyles.identityPanel)}>
          <HStack
            gap={4}
            vAlign="center"
            className={sx(homeStyles.identityHead)}
            {...getSearchTargetProps(`${accountName} ${account?.wxid ?? ""}`)}
          >
            <Text className={sx(homeStyles.avatarHero)} weight="bold">
              {avatarLabel || "微"}
            </Text>
            <VStack gap={2}>
              <Text type="supporting" color="accent" weight="bold">
                当前账号卡
              </Text>
              <Text weight="bold">{accountName}</Text>
              <Text type="supporting" color="secondary">
                微信号：{account?.wxid ?? "完成首次备份后显示"} ·{" "}
                {platformLabel}
              </Text>
            </VStack>
          </HStack>

          <HStack gap={2} vAlign="center">
            <StatusDot
              variant={account ? "success" : "warning"}
              label={account ? "已连接" : "未连接"}
            />
            <Text type="supporting" color="secondary">
              {account
                ? "连接状态正常，首页统计会以该账号为默认范围。"
                : "请先导入或备份微信账号。"}
            </Text>
          </HStack>

          <Card
            padding={3}
            variant="transparent"
            className={sx(homeStyles.scopeNote)}
          >
            <Text weight="bold">默认作用范围</Text>
            <Text type="supporting" color="secondary">
              首页统计、聊天记录、导入导出和恢复都会优先使用这个账号。
            </Text>
          </Card>

          <section className={sx(homeStyles.metricStrip)}>
            <Metric
              label="会话"
              value={formatNumber(data.stats.conversationCount)}
            />
            <Metric
              label="消息"
              value={formatNumber(data.stats.messageCount)}
            />
            <Metric
              label="附件"
              value={formatNumber(data.stats.attachmentCount)}
            />
            <Metric
              label="完整度"
              value={data.archiveStatus.health === "ready" ? "100%" : "需检查"}
            />
          </section>

          <Switch
            label="自动备份"
            description="开启后会在后续任务页显示自动备份策略。"
            value={Boolean(account)}
            isDisabled={!account}
          />

          <HStack gap={2} className={sx(homeStyles.identityActions)}>
            <Button
              label="立即备份"
              variant="primary"
              onClick={() => {
                void onBackupAction?.();
              }}
            />
            <Button
              label={isScanning ? "正在扫描" : "重新扫描"}
              variant="secondary"
              icon={<Icon icon={RefreshCw} size="sm" />}
              isLoading={isScanning}
              onClick={startScan}
            />
            <Button
              label="查看详情"
              variant="secondary"
              onClick={() => setDrawer("account")}
            />
          </HStack>
        </VStack>

        <VStack gap={3} className={sx(homeStyles.accountRail)}>
          <HStack gap={2} vAlign="start" className={sx(homeStyles.header)}>
            <VStack gap={1}>
              <Text weight="bold">微信账号列表</Text>
              <Text type="supporting" color="secondary">
                多账号模式下先确认当前操作账号。
              </Text>
            </VStack>
            <Button
              label={isScanning ? "正在扫描" : "重新扫描"}
              variant="ghost"
              size="sm"
              onClick={startScan}
            />
          </HStack>

          <HStack gap={3} className={sx(homeStyles.accountRow)}>
            <Icon icon={UserRound} size="sm" />
            <VStack gap={0}>
              <Text>{accountName}</Text>
              <Text type="supporting" color="secondary">
                {account?.wxid ?? "暂无微信号"}
              </Text>
            </VStack>
            <Token
              label={account ? "当前" : "待导入"}
              color={account ? "green" : "orange"}
              size="sm"
            />
          </HStack>

          <Button
            label="查看备份位置"
            variant="secondary"
            onClick={() => setDrawer("archive")}
          />
        </VStack>
      </Card>

      <DetailDrawer
        isOpen={drawer === "account"}
        title="当前账号详情"
        subtitle="影响首页统计、聊天记录、导入导出和恢复默认范围"
        onOpenChange={(open) => setDrawer(open ? "account" : null)}
      >
        <VStack gap={3}>
          <Metric label="昵称" value={accountName} />
          <Metric label="微信号" value={account?.wxid ?? "暂无"} />
          <Metric
            label="最近备份"
            value={String(account?.lastBackupAt ?? "暂无")}
          />
          <Metric
            label="归档大小"
            value={formatStorage(data.stats.storageSize)}
          />
        </VStack>
      </DetailDrawer>

      <DetailDrawer
        isOpen={drawer === "archive"}
        title="当前归档详情"
        subtitle={data.archiveStatus.name}
        onOpenChange={(open) => setDrawer(open ? "archive" : null)}
      >
        <VStack gap={3}>
          <Metric label="归档名称" value={data.archiveStatus.name} />
          <Metric label="归档状态" value={data.archiveStatus.health} />
          <Metric
            label="来源类型"
            value={data.archiveStatus.sourceType ?? "未知"}
          />
          <Metric
            label="占用空间"
            value={formatStorage(data.stats.storageSize)}
          />
        </VStack>
      </DetailDrawer>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <VStack gap={1} className={sx(homeStyles.metricStripItem)}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Text weight="bold">{value}</Text>
    </VStack>
  );
}
