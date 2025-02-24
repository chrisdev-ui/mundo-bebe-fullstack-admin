"use server";

import { unstable_noStore } from "next/cache";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { ERRORS } from "@/constants/messages";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { env } from "@/env";
import {
  composeMiddleware,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { sendEmail } from "@/lib/sendgrid";
import { AppError } from "@/lib/utils.api";
import { forgotPasswordSchema, ForgotPasswordSchema } from "./validations";

const JWT_SECRET = env.JWT_SECRET;
const RESET_TOKEN_EXPIRY = "1h";

async function forgotPasswordBase(input: ForgotPasswordSchema) {
  unstable_noStore();

  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (!user) throw new AppError(ERRORS.USER_NOT_FOUND);

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: RESET_TOKEN_EXPIRY,
  });

  const resetUrl = new URL("/resetear-contrasena", env.NEXT_PUBLIC_APP_URL);
  resetUrl.searchParams.set("token", token);
  resetUrl.searchParams.set("email", input.email);

  await sendEmail({
    data: {
      templateName: "reset_password",
      to: input.email,
      name: user.name as string,
      webUrl: resetUrl.toString(),
    },
  });
}

export const forgotPassword = composeMiddleware<ForgotPasswordSchema, void>(
  withErrorHandling(),
  withValidation({
    schema: forgotPasswordSchema,
    errorMessage: "Datos de recuperación de contraseña inválidos",
  }),
  withRateLimit({
    requests: 10,
    duration: "10m",
    identifier: (input) => `forgot-password:${input.email}`,
  }),
)(forgotPasswordBase);
