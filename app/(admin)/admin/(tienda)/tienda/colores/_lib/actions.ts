"use server";

import { revalidateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { ERRORS, SUCCESS_MESSAGES } from "@/constants/messages";
import db from "@/db/drizzle";
import { colors, UserRoleValues } from "@/db/schema";
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
  createColorSchema,
  CreateColorSchema,
  updateColorActionSchema,
  UpdateColorActionSchema,
} from "./validations";

async function createColorBase(
  input: CreateColorSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  const color = await db.transaction(async (tx) => {
    const existingColor = await tx
      .select({ id: colors.id })
      .from(colors)
      .where(eq(colors.code, input.code))
      .then((rows) => rows[0]);

    if (existingColor) throw new AppError(ERRORS.COLOR_ALREADY_EXISTS);

    return tx
      .insert(colors)
      .values({
        name: input.name,
        code: input.code,
        active: input.active ?? true,
      })
      .returning()
      .then(takeFirstOrThrow);
  });

  revalidateTag("colors");
  revalidateTag("colors-count");

  return {
    data: color,
    message: SUCCESS_MESSAGES.COLOR_CREATED,
  };
}

async function updateColorBase(
  input: UpdateColorActionSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  if (input.code) {
    const existingColor = await db
      .select({ id: colors.id })
      .from(colors)
      .where(eq(colors.code, input.code))
      .then((rows) => rows[0]);

    if (existingColor && existingColor.id !== input.id) {
      throw new AppError(ERRORS.COLOR_ALREADY_EXISTS);
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

  const color = await db
    .update(colors)
    .set(cleanUpdateData)
    .where(eq(colors.id, input.id))
    .returning()
    .then(takeFirstOrThrow);

  revalidateTag("colors");
  revalidateTag("colors-count");

  return {
    data: color,
    message: SUCCESS_MESSAGES.COLOR_UPDATED,
  };
}

async function deleteColorBase(
  input: { ids: string[] },
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  await db
    .update(colors)
    .set({ active: false, updatedAt: new Date() })
    .where(inArray(colors.id, input.ids));

  revalidateTag("colors");
  revalidateTag("colors-count");

  return {
    message: SUCCESS_MESSAGES.COLOR_DELETED,
  };
}

export const createColor = composeMiddleware<
  CreateColorSchema,
  Awaited<ReturnType<typeof createColorBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: createColorSchema,
    errorMessage: "Datos de color inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(createColorBase);

export const updateColor = composeMiddleware<
  UpdateColorActionSchema,
  Awaited<ReturnType<typeof updateColorBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: updateColorActionSchema,
    errorMessage: "Datos de color inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(updateColorBase);

export const deleteColors = composeMiddleware<
  { ids: string[] },
  Awaited<ReturnType<typeof deleteColorBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: z.object({
      ids: z.array(z.string()).min(1, "Debe seleccionar al menos un color"),
    }),
    errorMessage: "Datos de color inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(deleteColorBase);
