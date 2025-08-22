"use server";

import { revalidateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { ERRORS, SUCCESS_MESSAGES } from "@/constants/messages";
import db from "@/db/drizzle";
import { productTypes, UserRoleValues } from "@/db/schema";
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
  createProductTypeSchema,
  CreateProductTypeSchema,
  updateProductTypeActionSchema,
  UpdateProductTypeActionSchema,
} from "./validations";

async function createProductTypeBase(
  input: CreateProductTypeSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  const productType = await db.transaction(async (tx) => {
    const existingProductType = await tx
      .select({ id: productTypes.id })
      .from(productTypes)
      .where(eq(productTypes.code, input.code))
      .then((rows) => rows[0]);

    if (existingProductType) throw new AppError(ERRORS.PRODUCT_TYPE_ALREADY_EXISTS);

    return tx
      .insert(productTypes)
      .values({
        name: input.name,
        code: input.code,
        description: input.description,
        active: input.active ?? true,
      })
      .returning()
      .then(takeFirstOrThrow);
  });

  revalidateTag("product-types");
  revalidateTag("product-types-count");

  return {
    data: productType,
    message: SUCCESS_MESSAGES.PRODUCT_TYPE_CREATED,
  };
}

async function updateProductTypeBase(
  input: UpdateProductTypeActionSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  if (input.code) {
    const existingProductType = await db
      .select({ id: productTypes.id })
      .from(productTypes)
      .where(eq(productTypes.code, input.code))
      .then((rows) => rows[0]);

    if (existingProductType && existingProductType.id !== input.id) {
      throw new AppError(ERRORS.PRODUCT_TYPE_ALREADY_EXISTS);
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

  const productType = await db
    .update(productTypes)
    .set(cleanUpdateData)
    .where(eq(productTypes.id, input.id))
    .returning()
    .then(takeFirstOrThrow);

  revalidateTag("product-types");
  revalidateTag("product-types-count");

  return {
    data: productType,
    message: SUCCESS_MESSAGES.PRODUCT_TYPE_UPDATED,
  };
}

async function deleteProductTypesBase(
  input: { ids: string[] },
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  await db
    .update(productTypes)
    .set({ active: false, updatedAt: new Date() })
    .where(inArray(productTypes.id, input.ids));

  revalidateTag("product-types");
  revalidateTag("product-types-count");

  return {
    message: SUCCESS_MESSAGES.PRODUCT_TYPE_DELETED,
  };
}

export const createProductType = composeMiddleware<
  CreateProductTypeSchema,
  Awaited<ReturnType<typeof createProductTypeBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: createProductTypeSchema,
    errorMessage: "Datos de tipo de producto inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(createProductTypeBase);

export const updateProductType = composeMiddleware<
  UpdateProductTypeActionSchema,
  Awaited<ReturnType<typeof updateProductTypeBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: updateProductTypeActionSchema,
    errorMessage: "Datos de tipo de producto inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(updateProductTypeBase);

export const deleteProductTypes = composeMiddleware<
  { ids: string[] },
  Awaited<ReturnType<typeof deleteProductTypesBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: z.object({
      ids: z.array(z.string()).min(1, "Debe seleccionar al menos un tipo de producto"),
    }),
    errorMessage: "Datos de tipo de producto inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(deleteProductTypesBase);