import { HStack, Stack, VStack } from "@astryxdesign/core/Stack";
import { Switch } from "@astryxdesign/core/Switch";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useEffect, useMemo, useState } from "react";

import { PathSettingRow } from "./PathSettingRow";
import { SecuritySettings } from "./SecuritySettings";
import { SettingSection } from "./SettingSection";
import { settingsStyles, sx } from "./styles";

export interface SettingsPageProps {
  query?: string;
  onSaveSetting: (key: string, value: unknown) => Promise<void> | void;
  onCheckPath: (key: string, path: string) => Promise<boolean> | boolean;
}

type PathStatus = "idle" | "checking" | "writable" | "blocked";

const PATHS = {
  backup: "/Users/local/Documents/WeArchive",
  export: "/Users/local/Documents/WeArchive/exports",
};

export function SettingsPage({
  query = "",
  onSaveSetting,
  onCheckPath,
}: SettingsPageProps) {
  const [search, setSearch] = useState(query);
  const [switches, setSwitches] = useState({
    "export.maskSensitiveDefault": false,
    "security.localEncryptionPreview": false,
    "notifications.taskFinished": true,
    "performance.lowPowerMode": false,
  });
  const [pathStatus, setPathStatus] = useState<Record<string, PathStatus>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setSearch(query);
  }, [query]);

  const filteredSections = useMemo(
    () =>
      SETTINGS_SECTIONS.filter((section) =>
        `${section.title} ${section.description} ${section.keywords}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [search],
  );

  const saveSwitch = async (key: keyof typeof switches, value: boolean) => {
    const previousValue = switches[key];

    setSwitches((current) => ({ ...current, [key]: value }));
    try {
      await onSaveSetting(key, value);
      setFeedback(`已保存 ${getSwitchLabel(key)}`);
    } catch {
      setSwitches((current) => ({ ...current, [key]: previousValue }));
      setFeedback(`保存失败，已恢复 ${getSwitchLabel(key)}`);
    }
  };

  const checkPath = async (key: string, path: string) => {
    setPathStatus((current) => ({ ...current, [key]: "checking" }));
    const writable = await onCheckPath(key, path);
    setPathStatus((current) => ({
      ...current,
      [key]: writable ? "writable" : "blocked",
    }));
  };

  return (
    <VStack gap={4} className={sx(settingsStyles.page)}>
      <HStack gap={3} vAlign="center" className={sx(settingsStyles.header)}>
        <VStack gap={1}>
          <Text weight="bold">设置</Text>
          <Text type="supporting" color="secondary">
            管理备份、存储、导出、安全和通知默认值。
          </Text>
        </VStack>
        {feedback ? (
          <Text type="supporting" className={sx(settingsStyles.statusBox)}>
            {feedback}
          </Text>
        ) : null}
      </HStack>

      <TextInput
        label="搜索设置"
        size="sm"
        value={search}
        placeholder="搜索备份、路径、安全或通知"
        hasClear
        className={sx(settingsStyles.search)}
        onChange={setSearch}
      />

      <Stack className={sx(settingsStyles.sectionGrid)}>
        {filteredSections.map((section) => (
          <SettingSection
            key={section.id}
            title={section.title}
            description={section.description}
          >
            {section.id === "backup" ? (
              <PathSettingRow
                label="备份路径"
                settingKey="backup.path"
                path={PATHS.backup}
                {...(pathStatus["backup.path"]
                  ? { status: pathStatus["backup.path"] }
                  : {})}
                onCheckPath={checkPath}
              />
            ) : null}

            {section.id === "storage" ? (
              <PathSettingRow
                label="导出路径"
                settingKey="export.path"
                path={PATHS.export}
                {...(pathStatus["export.path"]
                  ? { status: pathStatus["export.path"] }
                  : {})}
                onCheckPath={checkPath}
              />
            ) : null}

            {section.id === "export" ? (
              <SettingSwitch
                label="默认隐藏手机号和微信号"
                description="导出 HTML、CSV、JSON 时默认做脱敏预览。"
                value={switches["export.maskSensitiveDefault"]}
                onChange={(value) =>
                  void saveSwitch("export.maskSensitiveDefault", value)
                }
              />
            ) : null}

            {section.id === "security" ? (
              <VStack gap={3}>
                <SettingSwitch
                  label="启用本地加密预览"
                  description="仅保存开关意图，完整静态加密不在 MVP 执行。"
                  value={switches["security.localEncryptionPreview"]}
                  onChange={(value) =>
                    void saveSwitch("security.localEncryptionPreview", value)
                  }
                />
                <SecuritySettings
                  password={password}
                  onPasswordChange={setPassword}
                />
              </VStack>
            ) : null}

            {section.id === "notifications" ? (
              <SettingSwitch
                label="任务完成提醒"
                description="备份、导入、导出完成后显示系统提醒。"
                value={switches["notifications.taskFinished"]}
                onChange={(value) =>
                  void saveSwitch("notifications.taskFinished", value)
                }
              />
            ) : null}

            {section.id === "performance" ? (
              <SettingSwitch
                label="低功耗模式"
                description="降低后台扫描并发，适合 NAS 低负载运行。"
                value={switches["performance.lowPowerMode"]}
                onChange={(value) =>
                  void saveSwitch("performance.lowPowerMode", value)
                }
              />
            ) : null}

            {section.id === "advanced" ? (
              <VStack gap={2} className={sx(settingsStyles.row)}>
                <Text weight="bold">高级诊断</Text>
                <Text type="supporting" color="secondary">
                  保留操作日志、导入报告和导出报告，便于后续排查。
                </Text>
              </VStack>
            ) : null}
          </SettingSection>
        ))}
      </Stack>
    </VStack>
  );
}

function SettingSwitch({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <HStack gap={3} vAlign="center" className={sx(settingsStyles.row)}>
      <VStack gap={1} className={sx(settingsStyles.rowMeta)}>
        <Text weight="bold">{label}</Text>
        <Text type="supporting" color="secondary">
          {description}
        </Text>
      </VStack>
      <Switch label={label} value={value} onChange={onChange} />
    </HStack>
  );
}

function getSwitchLabel(key: keyof ReturnType<typeof getDefaultSwitches>) {
  return SWITCH_LABELS[key];
}

function getDefaultSwitches() {
  return {
    "export.maskSensitiveDefault": false,
    "security.localEncryptionPreview": false,
    "notifications.taskFinished": true,
    "performance.lowPowerMode": false,
  };
}

const SWITCH_LABELS: Record<
  keyof ReturnType<typeof getDefaultSwitches>,
  string
> = {
  "export.maskSensitiveDefault": "默认隐藏手机号和微信号",
  "security.localEncryptionPreview": "启用本地加密预览",
  "notifications.taskFinished": "任务完成提醒",
  "performance.lowPowerMode": "低功耗模式",
};

const SETTINGS_SECTIONS = [
  {
    id: "backup",
    title: "备份",
    description: "备份频率、任务入口和默认保存位置。",
    keywords: "backup path 备份 路径",
  },
  {
    id: "storage",
    title: "存储",
    description: "检查导入、导出和附件目录的读写权限。",
    keywords: "storage export path 存储 导出 路径",
  },
  {
    id: "export",
    title: "导出默认值",
    description: "导出格式、脱敏和内容范围默认值。",
    keywords: "export mask 脱敏 导出",
  },
  {
    id: "security",
    title: "安全",
    description: "本地加密预览、密码强度和导出安全默认值。",
    keywords: "security password encryption 安全 密码 加密",
  },
  {
    id: "notifications",
    title: "通知",
    description: "任务完成、失败和需要处理时的提醒方式。",
    keywords: "notification notify 通知 提醒",
  },
  {
    id: "performance",
    title: "性能",
    description: "控制扫描并发、低功耗模式和后台占用。",
    keywords: "performance power 性能 低功耗",
  },
  {
    id: "advanced",
    title: "高级",
    description: "诊断日志、报告保留和未来迁移选项。",
    keywords: "advanced logs report 高级 日志 报告",
  },
] as const;
