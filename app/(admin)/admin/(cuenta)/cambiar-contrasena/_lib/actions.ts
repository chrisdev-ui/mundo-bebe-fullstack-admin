"use server";

import { unstable_noStore } from "next/cache";
import { compareSync } from "bcrypt-ts";
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
import { generatePassword } from "@/lib/utils";
import { AppError } from "@/lib/utils.api";
import { UserRole } from "@/types/enum";
import { ChangePasswordSchema, formSchema } from "./validations";

async function changePasswordBase(
  input: ChangePasswordSchema,
  ctx: ActionContext = {},
) {
  unstable_noStore();

  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHORIZED);

  const user = await db.query.users.findFirst({
    where: eq(users.id, ctx.session.user.id),
  });

  if (!user)
    throw new AppError(ERRORS.USER_NOT_FOUND, { userId: ctx.session.user.id });

  if (!user.password)
    throw new AppError(ERRORS.USER_NOT_ALLOWED_TO_CHANGE_PASSWORD);

  const isValidPassword = compareSync(input.currentPassword, user.password);
  if (!isValidPassword) throw new AppError(ERRORS.INVALID_PASSWORD);

  const isSamePassword = compareSync(input.newPassword, user.password);
  if (isSamePassword) throw new AppError(ERRORS.SAME_PASSWORD);

  const hash = generatePassword(input.newPassword);

  await db
    .update(users)
    .set({
      password: hash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, ctx.session.user.id));
}

export const changePassword = composeMiddleware<ChangePasswordSchema, void>(
  withErrorHandling(),
  withValidation({
    schema: formSchema,
    errorMessage: "Datos de cambio de contraseña inválidos",
  }),
  withAuth({
    requiredRole: [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 5,
    duration: "5m",
  }),
)(changePasswordBase);
