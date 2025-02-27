"use server";

import { unstable_noStore } from "next/cache";
import { and, eq, gt } from "drizzle-orm";

import { ERRORS } from "@/constants/messages";
import db from "@/db/drizzle";
import { invitations, UserRoleValues, users } from "@/db/schema";
import { env } from "@/env";
import {
  composeMiddleware,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { generatePassword } from "@/lib/utils";
import { AppError } from "@/lib/utils.api";
import { UserRole } from "@/types";
import { actionSchema, RegisterSchema } from "./validations";

async function registerBase(input: RegisterSchema) {
  unstable_noStore();

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingUser) throw new AppError(ERRORS.USER_EXISTS);

  let userRole: UserRole = env.SUPER_ADMIN_EMAIL.includes(input.email)
    ? UserRoleValues.SUPER_ADMIN
    : UserRoleValues.USER;

  await db.transaction(async (tx) => {
    if (input.code) {
      const invitation = await tx.query.invitations.findFirst({
        where: and(
          eq(invitations.token, input.code),
          eq(invitations.email, input.email),
          gt(invitations.expires, new Date()),
        ),
      });

      if (!invitation || invitation.used)
        throw new AppError(ERRORS.INVALID_CODE);

      userRole = UserRoleValues.ADMIN;

      await tx
        .update(invitations)
        .set({ used: true })
        .where(eq(invitations.id, invitation.id));
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
