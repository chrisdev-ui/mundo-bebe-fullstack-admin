"use server";

import { unstable_noStore } from "next/cache";
import { and, eq, gt } from "drizzle-orm";

import { ERRORS } from "@/constants/messages";
import db from "@/db/drizzle";
import { invites, users } from "@/db/schema";
import { env } from "@/env";
import {
  composeMiddleware,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { generatePassword } from "@/lib/utils";
import { AppError } from "@/lib/utils.api";
import { UserRole } from "@/types/enum";
import { actionSchema, RegisterSchema } from "./validations";

async function registerBase(input: RegisterSchema) {
  unstable_noStore();

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingUser) throw new AppError(ERRORS.USER_EXISTS);

  let userRole = env.SUPER_ADMIN_EMAIL.includes(input.email)
    ? UserRole.SUPER_ADMIN
    : UserRole.USER;

  await db.transaction(async (tx) => {
    if (input.code) {
      const invitation = await tx.query.invites.findFirst({
        where: and(
          eq(invites.token, input.code),
          eq(invites.email, input.email),
          gt(invites.expiresAt, new Date()),
        ),
      });

      if (!invitation || invitation.used)
        throw new AppError(ERRORS.INVALID_CODE);

      userRole = UserRole.ADMIN;

      await tx
        .update(invites)
        .set({ used: true })
        .where(eq(invites.id, invitation.id));
    }

    const hash = generatePassword(input.password);

    await tx.insert(users).values({
      name: input.name,
      lastName: input.lastName,
      username: input.username || input.email,
      password: hash,
      email: input.email,
      emailVerified: new Date(),
      role: userRole,
    });
  });
}

export const register = composeMiddleware<RegisterSchema, void>(
  withErrorHandling(),
  withValidation({
    schema: actionSchema,
    errorMessage: "Datos de registro inválidos",
  }),
  withRateLimit({
    requests: 10,
    duration: "5m",
    identifier: (input) => `register:${input.email}`,
  }),
)(registerBase);
