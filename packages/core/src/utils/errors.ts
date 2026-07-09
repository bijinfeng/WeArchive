import { AppError, ErrorCode } from "../types";

export { AppError, ErrorCode };

/**
 * 创建应用错误
 */
export function createError(
  code: string,
  message: string,
  details?: unknown,
): AppError {
  return new AppError(message, code, details);
}

/**
 * 判断是否为应用错误
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 错误转换为可序列化的对象（用于 IPC 传输）
 */
export function serializeError(error: unknown): {
  name: string;
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
} {
  if (isAppError(error)) {
    const result: {
      name: string;
      message: string;
      code: string;
      details?: unknown;
      stack?: string;
    } = {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
    };
    if (error.stack) {
      result.stack = error.stack;
    }
    return result;
  }

  if (error instanceof Error) {
    const result: {
      name: string;
      message: string;
      code: string;
      stack?: string;
    } = {
      name: error.name,
      message: error.message,
      code: ErrorCode.UNKNOWN_ERROR,
    };
    if (error.stack) {
      result.stack = error.stack;
    }
    return result;
  }

  return {
    name: "UnknownError",
    message: String(error),
    code: ErrorCode.UNKNOWN_ERROR,
  };
}

/**
 * 从序列化对象还原错误（用于渲染进程）
 */
export function deserializeError(
  data: ReturnType<typeof serializeError>,
): AppError {
  return new AppError(
    data.message,
    data.code || ErrorCode.UNKNOWN_ERROR,
    data.details,
  );
}
