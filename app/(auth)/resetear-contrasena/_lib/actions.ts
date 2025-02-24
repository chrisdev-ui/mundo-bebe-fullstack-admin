"use server";

import { unstable_noStore } from "next/cache";
import { differenceInMinutes, parseISO } from "date-fns";
import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { PASSWORD_CHANGE_COOLDOWN_MINUTES } from "@/constants";
import { ERRORS } from "@/constants/messages";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { env } from "@/env";
import {
  composeMiddleware,
  withErrorHandling,
  withValidation,
} from "@/lib/middleware";
import { generatePassword } from "@/lib/utils";
import { AppError } from "@/lib/utils.api";
import { actionSchema, ResetPasswordSchema } from "./validations";

const JWT_SECRET = env.JWT_SECRET;

interface DecodedJwt {
  userId: string;
  email: string;
}

async function resetPasswordBase(input: ResetPasswordSchema) {
  unstable_noStore();

  let decoded: DecodedJwt;
  try {
    decoded = jwt.verify(input.token, JWT_SECRET) as DecodedJwt;
  } catch (error) {
    throw new AppError(ERRORS.INVALID_JWT);
  }

  const user = await db.query.users.findFirst({
    where: and(eq(users.id, decoded.userId), eq(users.email, decoded.email)),
  });

  if (!user) {
    throw new AppError(ERRORS.JWT_USER_NOT_FOUND);
  }

  const minutesSinceLastUpdate = differenceInMinutes(
    new Date(),
    parseISO(user.updatedAt.toISOString()),
  );

  if (minutesSinceLastUpdate < PASSWORD_CHANGE_COOLDOWN_MINUTES) {
    throw new AppError(
      `Debes esperar ${PASSWORD_CHANGE_COOLDOWN_MINUTES - minutesSinceLastUpdate} minutos antes de cambiar tu contraseña nuevamente.`,
    );
  }

  const hash = generatePassword(input.newPassword);

  await db
    .update(users)
    .set({
      password: hash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));
}

export const resetPassword = composeMiddleware<ResetPasswordSchema, void>(
  withErrorHandling(),
  withValidation({
    schema: actionSchema,
    errorMessage: "Datos de restablecimiento de contraseña inválidos",
  }),
)(resetPasswordBase);
