"use server";

import { revalidateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { ERRORS, SUCCESS_MESSAGES } from "@/constants/messages";
import db from "@/db/drizzle";
import { sizes, UserRoleValues } from "@/db/schema";
import { takeFirstOrThrow } from "@/db/utils";
import {
  ActionContext,
  composeMiddleware,
  withAuth,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { AppError } from "@/lib/utils.api";
import {
  createSizeSchema,
  CreateSizeSchema,
  updateSizeActionSchema,
  UpdateSizeActionSchema,
} from "./validations";

async function createSizeBase(
  input: CreateSizeSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  const size = await db.transaction(async (tx) => {
    const existingSize = await tx
      .select({ id: sizes.id })
      .from(sizes)
      .where(eq(sizes.code, input.code))
      .then((rows) => rows[0]);

    if (existingSize) throw new AppError(ERRORS.SIZE_ALREADY_EXISTS);

    return tx
      .insert(sizes)
      .values({
        name: input.name,
        code: input.code,
        active: input.active ?? true,
      })
      .returning()
      .then(takeFirstOrThrow);
  });

  revalidateTag("sizes");
  revalidateTag("sizes-count");

  return {
    data: size,
    message: SUCCESS_MESSAGES.SIZE_CREATED,
  };
}

async function updateSizeBase(
  input: UpdateSizeActionSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  if (input.code) {
    const existingSize = await db
      .select({ id: sizes.id })
      .from(sizes)
      .where(eq(sizes.code, input.code))
      .then((rows) => rows[0]);

    if (existingSize && existingSize.id !== input.id) {
      throw new AppError(ERRORS.SIZE_ALREADY_EXISTS);
    }
  }

  const updateDate = {
    name: input.name,
    code: input.code,
    active: input.active,
    updatedAt: new Date(),
  };

  const cleanUpdateData = Object.fromEntries(
    Object.entries(updateDate).filter(([_, v]) => v !== undefined),
  );

  const size = await db
    .update(sizes)
    .set(cleanUpdateData)
    .where(eq(sizes.id, input.id))
    .returning()
    .then(takeFirstOrThrow);

  revalidateTag("sizes");
  revalidateTag("sizes-count");

  return {
    data: size,
    message: SUCCESS_MESSAGES.SIZE_UPDATED,
  };
}

async function deleteSizeBase(
  input: { ids: string[] },
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  await db
    .update(sizes)
    .set({ active: false, updatedAt: new Date() })
    .where(inArray(sizes.id, input.ids));

  revalidateTag("sizes");
  revalidateTag("sizes-count");

  return {
    message: SUCCESS_MESSAGES.SIZE_DELETED,
  };
}

export const createSize = composeMiddleware<
  CreateSizeSchema,
  Awaited<ReturnType<typeof createSizeBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: createSizeSchema,
    errorMessage: "Datos de talla inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(createSizeBase);

export const updateSize = composeMiddleware<
  UpdateSizeActionSchema,
  Awaited<ReturnType<typeof updateSizeBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: updateSizeActionSchema,
    errorMessage: "Datos de talla inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(updateSizeBase);

export const deleteSizes = composeMiddleware<
  { ids: string[] },
  Awaited<ReturnType<typeof deleteSizeBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: z.object({
      ids: z.array(z.string()).min(1, "Debe seleccionar al menos una talla"),
    }),
    errorMessage: "Datos de talla inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(deleteSizeBase);
