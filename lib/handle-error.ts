import { isRedirectError } from "next/dist/client/components/redirect";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { ERRORS } from "@/constants/messages";

export function getErrorMessage(err: unknown, shouldLog: boolean = true) {
  const unknownError = ERRORS.INTERNAL_SERVER_ERROR;

  if (err instanceof z.ZodError) {
    if (shouldLog) console.error("Zod error", err);
    const errors = err.issues.map((issue) => {
      return issue.message;
    });
    return errors.join("\n");
  }

  if (err instanceof jwt.JsonWebTokenError) {
    if (shouldLog) console.error("JsonWebTokenError", err);
    return ERRORS.INVALID_JWT;
  }

  if (err instanceof Error) {
    if (shouldLog) console.error("Error", err);
    return err.message;
  }

  if (isRedirectError(err)) {
    if (shouldLog) console.error("Redirect error", err);
    throw err;
  }

  if (shouldLog) console.error("Unknown error", err);
  return unknownError;
}
