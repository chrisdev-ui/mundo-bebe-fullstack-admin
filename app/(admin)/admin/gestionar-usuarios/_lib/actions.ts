"use server";

import { revalidateTag, unstable_noStore } from "next/cache";
import { eq, inArray } from "drizzle-orm";

import { ERRORS, SUCCESS_MESSAGES } from "@/constants/messages";
import db from "@/db/drizzle";
import { UserRoleValues, users } from "@/db/schema";
import { takeFirstOrThrow } from "@/db/utils";
import { deleteBlob } from "@/lib/actions";
import {
  ActionContext,
  composeMiddleware,
  withAuth,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { AppError } from "@/lib/utils.api";
import { UserRole } from "@/types";
import {
  createUserSchema,
  CreateUserSchema,
  updateUserActionSchema,
  UpdateUserActionSchema,
} from "./validations";

function canManageRole(
  currentUserRole: UserRole,
  targetRole: UserRole,
): boolean {
  const roleHierarchy: Record<UserRole, UserRole[]> = {
    [UserRoleValues.SUPER_ADMIN]: [
      UserRoleValues.ADMIN,
      UserRoleValues.USER,
      UserRoleValues.GUEST,
    ],
    [UserRoleValues.ADMIN]: [UserRoleValues.USER, UserRoleValues.GUEST],
    [UserRoleValues.USER]: [],
    [UserRoleValues.GUEST]: [],
  };

  return roleHierarchy[currentUserRole]?.includes(targetRole) ?? false;
}

async function createUserBase(
  input: CreateUserSchema,
  ctx: ActionContext = {},
) {
  unstable_noStore();

  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  if (!canManageRole(ctx.session.user.role, input.role)) {
    throw new AppError(ERRORS.FORBIDDEN);
  }

  const user = await db.transaction(async (tx) => {
    const existingUser = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .then((rows) => rows[0]);

    if (existingUser) throw new AppError(ERRORS.EMAIL_ALREADY_EXISTS);

    return tx
      .insert(users)
      .values({
        name: input.name,
        lastName: input.lastName,
        username: input.username ?? input.email,
        password: input.password,
        email: input.email,
        phoneNumber: input.phoneNumber,
        image: input.image as string,
        role: input.role,
        dob: input.dob,
      })
      .returning()
      .then(takeFirstOrThrow);
  });

  revalidateTag("users");
  revalidateTag("user-role-counts");

  return {
    data: user,
    message: SUCCESS_MESSAGES.USER_CREATED,
  };
}

async function deleteUsersBase(
  input: { ids: string[] },
  ctx: ActionContext = {},
) {
  unstable_noStore();

  if (!ctx.session?.user?.id) {
    throw new AppError(ERRORS.UNAUTHENTICATED);
  }

  await db.transaction(async (tx) => {
    await tx.delete(users).where(inArray(users.id, input.ids));
  });

  revalidateTag("users");
  revalidateTag("user-role-counts");

  return {
    message: SUCCESS_MESSAGES.USER_DELETED,
  };
}

async function updateUserBase(
  input: UpdateUserActionSchema,
  ctx: ActionContext = {},
) {
  unstable_noStore();

  if (!ctx.session?.user?.id) {
    throw new AppError(ERRORS.UNAUTHENTICATED);
  }

  const targetUser = await db
    .select()
    .from(users)
    .where(eq(users.id, input.id))
    .then(takeFirstOrThrow);

  if (!canManageRole(ctx.session.user.role, targetUser.role)) {
    throw new AppError(ERRORS.FORBIDDEN);
  }

  if (
    input.role !== targetUser.role &&
    !canManageRole(ctx.session.user.role, input.role as UserRole)
  ) {
    throw new AppError(ERRORS.INSUFICIENT_PERMISSIONS_FOR_ROLE_CHANGE);
  }

  if (input.email && input.email !== targetUser.email) {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email))
      .then((rows) => rows[0]);

    if (existingUser) {
      throw new AppError(ERRORS.EMAIL_ALREADY_EXISTS);
    }
  }

  if (targetUser.image && input.image !== targetUser.image) {
    try {
      // Validate if the URL is a valid Vercel Blob URL
      const isValidBlobUrl =
        targetUser.image.startsWith("https://") &&
        (targetUser.image.includes(".public.blob.vercel-storage.com") ||
          targetUser.image.includes(".blob.vercel-storage.com"));

      if (isValidBlobUrl) {
        await deleteBlob(targetUser.image);
      }
    } catch (error) {
      console.error("Error deleting previous image:", error);
    }
  }

  // Prepare update data
  const updateData = {
    name: input.name,
    lastName: input.lastName,
    username: input.username,
    email: input.email,
    phoneNumber: input.phoneNumber,
    image: input.image as string,
    role: input.role,
    dob: input.dob,
    updatedAt: new Date(),
  };

  // Remove undefined values
  const cleanUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined),
  );

  // Perform update
  const updatedUser = await db
    .update(users)
    .set(cleanUpdateData)
    .where(eq(users.id, input.id))
    .returning()
    .then(takeFirstOrThrow);

  revalidateTag("users");
  revalidateTag("user-role-counts");

  return {
    data: updatedUser,
    message: SUCCESS_MESSAGES.USER_UPDATED,
  };
}

export const createUser = composeMiddleware<
  CreateUserSchema,
  Awaited<ReturnType<typeof createUserBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: createUserSchema,
    errorMessage: "Datos de usuario inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(createUserBase);

export const updateUser = composeMiddleware<
  UpdateUserActionSchema,
  Awaited<ReturnType<typeof updateUserBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: updateUserActionSchema,
    errorMessage: "Datos de usuario inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(updateUserBase);

export const deleteUsers = composeMiddleware<
  { ids: string[] },
  Awaited<ReturnType<typeof deleteUsersBase>>
>(
  withErrorHandling(),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 5,
    duration: "1m",
  }),
)(deleteUsersBase);
