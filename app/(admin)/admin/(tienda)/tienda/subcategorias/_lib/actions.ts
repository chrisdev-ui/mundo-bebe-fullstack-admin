"use server";

import { revalidateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";

import { ERRORS, SUCCESS_MESSAGES } from "@/constants/messages";
import db from "@/db/drizzle";
import { subcategories, UserRoleValues } from "@/db/schema";
import { takeFirstOrThrow } from "@/db/utils";
import {
  ActionContext,
  composeMiddleware,
  withAuth,
  withErrorHandling,
  withRateLimit,
  withValidation,
} from "@/lib/middleware";
import { slugify } from "@/lib/utils";
import { AppError } from "@/lib/utils.api";
import {
  createSubcategorySchema,
  CreateSubcategorySchema,
  updateSubcategoryActionSchema,
  UpdateSubcategoryActionSchema,
} from "./validations";

async function createSubcategoryBase(
  input: CreateSubcategorySchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  const subcategory = await db.transaction(async (tx) => {
    const existingSubcategory = await tx
      .select({ id: subcategories.id })
      .from(subcategories)
      .where(eq(subcategories.slug, slugify(input.slug)))
      .then((rows) => rows[0]);

    if (existingSubcategory) throw new AppError(ERRORS.SLUG_ALREADY_EXISTS);

    return tx
      .insert(subcategories)
      .values({
        name: input.name,
        description: input.description,
        slug: slugify(input.slug),
        categoryId: input.categoryId,
        active: input.active ?? true,
      })
      .returning()
      .then(takeFirstOrThrow);
  });

  revalidateTag("subcategories");
  revalidateTag("subcategories-count");
  revalidateTag("active-categories");

  return {
    data: subcategory,
    message: SUCCESS_MESSAGES.SUBCATEGORY_CREATED,
  };
}

async function updateSubcategoryBase(
  input: UpdateSubcategoryActionSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  if (input.slug) {
    const existingSubcategory = await db
      .select({ id: subcategories.id })
      .from(subcategories)
      .where(eq(subcategories.slug, slugify(input.slug)))
      .then((rows) => rows[0]);

    if (existingSubcategory && existingSubcategory.id !== input.id) {
      throw new AppError(ERRORS.SLUG_ALREADY_EXISTS);
    }
  }

  const updateData = {
    name: input.name,
    description: input.description,
    slug: input.slug ? slugify(input.slug) : undefined,
    categoryId: input.categoryId,
    active: input.active,
    updatedAt: new Date(),
  };

  // Remove undefined values
  const cleanUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined),
  );

  const subcategory = await db
    .update(subcategories)
    .set(cleanUpdateData)
    .where(eq(subcategories.id, input.id))
    .returning()
    .then(takeFirstOrThrow);

  revalidateTag("subcategories");
  revalidateTag("subcategories-count");
  revalidateTag("active-categories");

  return {
    data: subcategory,
    message: SUCCESS_MESSAGES.SUBCATEGORY_UPDATED,
  };
}

async function deleteSubcategoriesBase(
  input: { ids: string[] },
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  await db
    .update(subcategories)
    .set({ active: false, updatedAt: new Date() })
    .where(inArray(subcategories.id, input.ids));

  revalidateTag("subcategories");
  revalidateTag("subcategories-count");
  revalidateTag("active-categories");

  return {
    message: SUCCESS_MESSAGES.SUBCATEGORY_DELETED,
  };
}

export const createSubcategory = composeMiddleware<
  CreateSubcategorySchema,
  Awaited<ReturnType<typeof createSubcategoryBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: createSubcategorySchema,
    errorMessage: "Datos de subcategoría inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(createSubcategoryBase);

export const updateSubcategory = composeMiddleware<
  UpdateSubcategoryActionSchema,
  Awaited<ReturnType<typeof updateSubcategoryBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: updateSubcategoryActionSchema,
    errorMessage: "Datos de subcategoría inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(updateSubcategoryBase);

export const deleteSubcategories = composeMiddleware<
  { ids: string[] },
  Awaited<ReturnType<typeof deleteSubcategoriesBase>>
>(
  withErrorHandling(),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 5,
    duration: "1m",
  }),
)(deleteSubcategoriesBase);
