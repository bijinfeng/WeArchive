import {
  formatFileSize,
  formatNumber,
  formatRelativeTime,
} from "@we-archive/core/utils";

// 重新导出 core 的工具函数
export { formatFileSize, formatNumber, formatRelativeTime };

/**
 * 类名合并工具
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
