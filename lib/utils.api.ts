import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";

import { ERRORS } from "@/constants/errors";
import type { ApiResponse } from "@/types/api";

type ErrorKey = keyof typeof ERRORS;

interface ErrorOptions {
  cause?: unknown;
  context?: Record<string, unknown>;
  shouldLog?: boolean;
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

export function handleError(
  error: unknown,
  defaultErrorKey: ErrorKey = "INTERNAL_SERVER_ERROR",
  options: ErrorOptions = {},
) {
  const { cause, context, shouldLog = true } = options;

  // If it's already a TRPC error, rethrow it
  if (error instanceof TRPCError) {
    throw error;
  }

  if (error instanceof jwt.JsonWebTokenError) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ERRORS.INVALID_JWT.message,
      cause: error,
    });
  }

  // Handle known error types
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

    // Map specific error types to TRPC errors
    switch (error.name) {
      case "JsonWebTokenError":
      case "TokenExpiredError":
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: ERRORS.UNAUTHORIZED.message,
          cause: error,
        });

      case "ValidationError":
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: ERRORS.INVALID_INPUT.message,
          cause: error,
        });

      case "DatabaseError":
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: ERRORS.OPERATION_FAILED.message,
          cause: error,
        });

      default: {
        const errorConfig =
          typeof ERRORS[defaultErrorKey] === "function"
            ? ERRORS[defaultErrorKey](cause as number)
            : ERRORS[defaultErrorKey];

        throw new TRPCError({
          code: errorConfig.code,
          message: errorConfig.message,
          cause: error,
        });
      }
    }
  }

  // For unknown error types, use the default error
  const errorConfig =
    typeof ERRORS[defaultErrorKey] === "function"
      ? ERRORS[defaultErrorKey](0)
      : ERRORS[defaultErrorKey];
  throw new TRPCError({
    code: errorConfig.code,
    message: errorConfig.message,
    cause: error,
  });
}

export function throwTRPCError(
  errorKey: ErrorKey,
  cause?: string | number,
  context?: Record<string, unknown>,
): never {
  const errorConfig =
    typeof ERRORS[errorKey] === "function"
      ? ERRORS[errorKey](cause as number)
      : ERRORS[errorKey];

  if (context) {
    console.error(`${errorKey} error context:`, context);
  }

  throw new TRPCError({
    code: errorConfig.code,
    message: errorConfig.message,
    cause,
  });
}
