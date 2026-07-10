import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";

export interface SecuritySettingsProps {
  password: string;
  onPasswordChange: (password: string) => void;
}

export function SecuritySettings({
  password,
  onPasswordChange,
}: SecuritySettingsProps) {
  const strength = getPasswordStrength(password);

  return (
    <VStack gap={2}>
      <TextInput
        label="本地加密密码"
        type="password"
        size="sm"
        value={password}
        description="用于预览本地加密强度，MVP 不会启用完整静态加密。"
        {...(strength.type ? { status: strength } : {})}
        onChange={onPasswordChange}
      />
      <Text type="supporting" color="secondary">
        {strength.label}
      </Text>
    </VStack>
  );
}

function getPasswordStrength(password: string) {
  if (password.length === 0) {
    return {
      type: undefined,
      message: undefined,
      label: "强度：未设置",
    };
  }

  if (password.length < 8) {
    return {
      type: "error" as const,
      message: "至少 8 位",
      label: "强度：较弱",
    };
  }

  return {
    type: "success" as const,
    message: "密码可用",
    label: "强度：可用",
  };
}
