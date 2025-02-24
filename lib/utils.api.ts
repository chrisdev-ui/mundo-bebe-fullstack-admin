import jwt from "jsonwebtoken";

import { ERRORS } from "@/constants/messages";
import type { ApiResponse } from "@/types/api";

type ErrorKey = keyof typeof ERRORS;

interface ErrorOptions {
  cause?: unknown;
  context?: Record<string, unknown>;
  shouldLog?: boolean;
}

export class AppError extends Error {
  context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.context = context;
  }
}

export function createSuccessResponse<T>(
  message: string,
  data: T | null = null,
): ApiResponse<T> {
  return {
    isSuccess: true,
    message,
    data,
  };
}

export function createErrorResponse(
  message: string,
  error?: unknown,
): ApiResponse<null> {
  return {
    isSuccess: false,
    message,
    data: null,
    error: error as Error,
  };
}

export function handleError(
  error: unknown,
  defaultErrorKey: ErrorKey = "INTERNAL_SERVER_ERROR",
  options: ErrorOptions = {},
) {
  const { cause, context, shouldLog = true } = options;

  if (error instanceof AppError) {
    return createErrorResponse(error.message, error);
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return createErrorResponse(ERRORS.INVALID_JWT, error);
  }

  if (error instanceof Error) {
    // Log error if needed
    if (shouldLog) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause,
        context,
      });
    }

    // Map specific error types
    switch (error.name) {
      case "JsonWebTokenError":
      case "TokenExpiredError":
        return createErrorResponse(ERRORS.UNAUTHORIZED, error);

      case "ValidationError":
        return createErrorResponse(ERRORS.INVALID_INPUT, error);

      default: {
        return createErrorResponse(ERRORS[defaultErrorKey], error);
      }
    }
  }

  return createErrorResponse(ERRORS[defaultErrorKey], error);
}
