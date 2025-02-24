"use server";

import { unstable_noStore } from "next/cache";
import { eq } from "drizzle-orm";

import { ERRORS } from "@/constants/messages";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import {
  ActionContext,
  composeMiddleware,
  withAuth,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { AppError } from "@/lib/utils.api";
import { UserRole } from "@/types/enum";
import { DeleteAccountSchema, formSchema } from "./validations";

async function deleteAccountBase(
  input: DeleteAccountSchema,
  ctx: ActionContext = {},
) {
  unstable_noStore();

  if (!ctx.session?.user?.id) {
    throw new AppError(ERRORS.UNAUTHENTICATED);
  }

  const userToDelete = await db.query.users.findFirst({
    where: eq(users.id, ctx.session.user.id),
  });

  if (!userToDelete) {
    throw new AppError(ERRORS.USER_NOT_FOUND, {
      userId: ctx.session.user.id,
    });
  }

  if (
    input.emailConfirmation.toLowerCase() !== userToDelete.email?.toLowerCase()
  ) {
    throw new AppError(ERRORS.EMAIL_MISMATCH);
  }

  // Check delete permissions based on role
  switch (ctx.session.user.role) {
    case UserRole.SUPER_ADMIN:
      throw new AppError(ERRORS.SUPER_ADMIN_SELF_DELETE);

    case UserRole.ADMIN:
    case UserRole.USER:
    case UserRole.GUEST:
      if (ctx.session.user.id !== userToDelete.id) {
        throw new AppError(ERRORS.USER_DELETE_UNAUTHORIZED);
      }
      break;

    default:
      throw new AppError(ERRORS.UNAUTHORIZED);
  }

  await db.delete(users).where(eq(users.id, ctx.session.user.id));
}

export const deleteAccount = composeMiddleware<DeleteAccountSchema, void>(
  withErrorHandling(),
  withValidation({
    schema: formSchema,
    errorMessage: "Datos de confirmación inválidos",
  }),
  withAuth({
    requiredRole: [UserRole.USER, UserRole.ADMIN],
  }),
  withRateLimit({
    requests: 3,
    duration: "5m",
  }),
)(deleteAccountBase);
