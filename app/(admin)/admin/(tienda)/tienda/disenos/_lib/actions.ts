"use server";

import { revalidateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { ERRORS, SUCCESS_MESSAGES } from "@/constants/messages";
import db from "@/db/drizzle";
import { designs, UserRoleValues } from "@/db/schema";
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
  createDesignSchema,
  CreateDesignSchema,
  updateDesignActionSchema,
  UpdateDesignActionSchema,
} from "./validations";

async function createDesignBase(
  input: CreateDesignSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  const design = await db.transaction(async (tx) => {
    const existingDesign = await tx
      .select({ id: designs.id })
      .from(designs)
      .where(eq(designs.code, input.code))
      .then((rows) => rows[0]);

    if (existingDesign) throw new AppError(ERRORS.DESIGN_ALREADY_EXISTS);

    return tx
      .insert(designs)
      .values({
        name: input.name,
        code: input.code,
        description: input.description,
        active: input.active ?? true,
      })
      .returning()
      .then(takeFirstOrThrow);
  });

  revalidateTag("designs");
  revalidateTag("designs-count");

  return {
    data: design,
    message: SUCCESS_MESSAGES.DESIGN_CREATED,
  };
}

async function updateDesignBase(
  input: UpdateDesignActionSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  if (input.code) {
    const existingDesign = await db
      .select({ id: designs.id })
      .from(designs)
      .where(eq(designs.code, input.code))
      .then((rows) => rows[0]);

    if (existingDesign && existingDesign.id !== input.id) {
      throw new AppError(ERRORS.DESIGN_ALREADY_EXISTS);
    }
  }

  const updateData = {
    name: input.name,
    code: input.code,
    description: input.description,
    active: input.active,
    updatedAt: new Date(),
  };

  const cleanUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined),
  );

  const design = await db
    .update(designs)
    .set(cleanUpdateData)
    .where(eq(designs.id, input.id))
    .returning()
    .then(takeFirstOrThrow);

  revalidateTag("designs");
  revalidateTag("designs-count");

  return {
    data: design,
    message: SUCCESS_MESSAGES.DESIGN_UPDATED,
  };
}

async function deleteDesignBase(
  input: { ids: string[] },
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  await db
    .update(designs)
    .set({ active: false, updatedAt: new Date() })
    .where(inArray(designs.id, input.ids));

  revalidateTag("designs");
  revalidateTag("designs-count");

  return {
    message: SUCCESS_MESSAGES.DESIGN_DELETED,
  };
}

export const createDesign = composeMiddleware<
  CreateDesignSchema,
  Awaited<ReturnType<typeof createDesignBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: createDesignSchema,
    errorMessage: "Datos de diseño inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(createDesignBase);

export const updateDesign = composeMiddleware<
  UpdateDesignActionSchema,
  Awaited<ReturnType<typeof updateDesignBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: updateDesignActionSchema,
    errorMessage: "Datos de diseño inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(updateDesignBase);

export const deleteDesigns = composeMiddleware<
  { ids: string[] },
  Awaited<ReturnType<typeof deleteDesignBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: z.object({
      ids: z.array(z.string()).min(1, "Debe seleccionar al menos un diseño"),
    }),
    errorMessage: "Datos de diseño inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(deleteDesignBase);
