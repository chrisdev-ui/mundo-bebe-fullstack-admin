"use server";

import { unstable_noStore } from "next/cache";
import { and, eq, lt } from "drizzle-orm";

import { AuthPaths } from "@/constants";
import { ERRORS } from "@/constants/messages";
import db from "@/db/drizzle";
import { invites, users } from "@/db/schema";
import { env } from "@/env";
import {
  composeMiddleware,
  withAuth,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { sendEmail } from "@/lib/sendgrid";
import { AppError } from "@/lib/utils.api";
import { UserRole } from "@/types/enum";
import { formSchema, InviteAdminSchema } from "./validations";

async function createInvitationBase(input: InviteAdminSchema) {
  unstable_noStore();

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingUser) throw new AppError(ERRORS.USER_EXISTS);

  const userHasActiveInvitation = await db.query.invites.findFirst({
    where: and(
      eq(invites.email, input.email),
      lt(invites.expiresAt, new Date()),
    ),
  });

  if (userHasActiveInvitation)
    throw new AppError(ERRORS.INVITATION_ALREADY_ACTIVE);

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const url = new URL("/registrarse", env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("code", token);
  url.searchParams.set("email", input.email);

  await db.transaction(async (tx) => {
    await tx.insert(invites).values({
      email: input.email,
      token,
      expiresAt,
    });

    await sendEmail({
      data: {
        templateName: "welcome",
        to: input.email,
        name: input.name,
        role: UserRole.ADMIN,
        webUrl: url.toString(),
      },
    });
  });
}

export const createInvitation = composeMiddleware<InviteAdminSchema, void>(
  withErrorHandling(),
  withValidation({
    schema: formSchema,
    errorMessage: "Datos de invitación inválidos",
  }),
  withAuth({
    requiredRole: [UserRole.SUPER_ADMIN],
    redirectTo: AuthPaths.LOGIN,
  }),
  withRateLimit({
    requests: 20,
    duration: "120s",
    identifier: (input) => `invite:${input.email}`,
  }),
)(createInvitationBase);
