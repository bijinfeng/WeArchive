import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
import { Inbox } from "lucide-react";

export interface EmptyActionProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyAction({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyActionProps) {
  return (
    <EmptyState
      isCompact
      icon={<Icon icon={Inbox} size="md" />}
      title={title}
      description={description}
      actions={
        <Button
          label={actionLabel}
          variant="primary"
          size="sm"
          onClick={onAction}
        />
      }
    />
  );
}
