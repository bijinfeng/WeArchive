import { getApiAdapter } from "../../../hooks";
import { SettingsPage } from "./SettingsPage";

export interface SettingsPageControllerProps {
  query?: string;
}

export function SettingsPageController({ query }: SettingsPageControllerProps) {
  return (
    <SettingsPage
      query={query ?? ""}
      onSaveSetting={async (key, value) => {
        await getApiAdapter().settings.set(key, value);
      }}
      onCheckPath={async (_key, path) => getApiAdapter().file.isWritable(path)}
    />
  );
}
