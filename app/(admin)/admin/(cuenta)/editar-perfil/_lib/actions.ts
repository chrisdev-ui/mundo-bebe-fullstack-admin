"use server";

import { unstable_noStore } from "next/cache";
import { eq } from "drizzle-orm";

import { ERRORS } from "@/constants/messages";
import db from "@/db/drizzle";
import { UserRoleValues, users } from "@/db/schema";
import {
  ActionContext,
  composeMiddleware,
  withAuth,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { AppError } from "@/lib/utils.api";
import { EditProfileSchema, formSchema } from "./validations";

async function updateProfileBase(
  input: EditProfileSchema,
  ctx: ActionContext = {},
) {
  unstable_noStore();

  if (!ctx.session?.user?.id) {
    throw new AppError(ERRORS.UNAUTHENTICATED);
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, ctx.session.user.id),
  });

  if (!existingUser)
    throw new AppError(ERRORS.USER_NOT_FOUND, {
      userId: ctx.session.user.id,
    });

  await db
    .update(users)
    .set({
      name: input.name,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      image: typeof input.avatar === "string" ? input.avatar : undefined,
      phoneNumber: input.phoneNumber,
      dob: input.dob,
      updatedAt: new Date(),
    })
    .where(eq(users.id, ctx.session.user.id));
}

export const updateProfile = composeMiddleware<EditProfileSchema, void>(
  withErrorHandling(),
  withValidation({
    schema: formSchema,
    errorMessage: "Datos de perfil inválidos",
  }),
  withAuth({
    requiredRole: [
      UserRoleValues.USER,
      UserRoleValues.ADMIN,
      UserRoleValues.SUPER_ADMIN,
    ],
  }),
  withRateLimit({
    requests: 10,
    duration: "2m",
    identifier: (input) => `update-profile:${input.email}`,
  }),
)(updateProfileBase);
