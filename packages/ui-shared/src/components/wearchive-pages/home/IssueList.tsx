import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Token } from "@astryxdesign/core/Token";
import type { WeArchiveIssue, WeArchiveViewId } from "@we-archive/core/types";

import { getSearchTargetProps } from "../../wearchive-shell/searchTargets";
import type { HomeNavigationIntent } from "./homeModel";
import { homeStyles, sx } from "./styles";

export interface IssueListProps {
  issues: WeArchiveIssue[];
  onNavigate?:
    | ((viewId: WeArchiveViewId, intent?: HomeNavigationIntent) => void)
    | undefined;
}

export function IssueList({ issues, onNavigate }: IssueListProps) {
  return (
    <Card padding={4} role="region" aria-label="异常提醒">
      <VStack gap={3}>
        <HStack gap={2} className={sx(homeStyles.header)} vAlign="center">
          <Text weight="bold">异常提醒</Text>
          <Token
            label={issues.length > 0 ? "可处理" : "正常"}
            color={issues.length > 0 ? "orange" : "green"}
            size="sm"
          />
        </HStack>
        {issues.length > 0 ? (
          <VStack gap={2}>
            {issues.slice(0, 3).map((issue) => (
              <HStack
                key={issue.id}
                gap={3}
                vAlign="center"
                className={sx(homeStyles.issueRow)}
                {...getSearchTargetProps(`${issue.title} ${issue.description}`)}
              >
                <VStack gap={1}>
                  <Text weight="bold">{issue.title}</Text>
                  <Text type="supporting" color="secondary">
                    {issue.description}
                  </Text>
                </VStack>
                <Button
                  label="查看"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    onNavigate?.(
                      issue.source === "attachment" ? "transfer" : "backup",
                      {
                        source: "home-summary",
                        issueId: issue.id,
                      },
                    )
                  }
                />
              </HStack>
            ))}
          </VStack>
        ) : (
          <Text type="supporting" color="secondary">
            当前没有需要处理的问题。
          </Text>
        )}
      </VStack>
    </Card>
  );
}
