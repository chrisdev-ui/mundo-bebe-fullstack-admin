"use server";

import { revalidateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";

import { ERRORS, SUCCESS_MESSAGES } from "@/constants/messages";
import db from "@/db/drizzle";
import { categories, UserRoleValues } from "@/db/schema";
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
  createCategorySchema,
  CreateCategorySchema,
  updateCategoryActionSchema,
  UpdateCategoryActionSchema,
} from "./validations";

async function createCategoryBase(
  input: CreateCategorySchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  const category = await db.transaction(async (tx) => {
    const existingCategory = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slugify(input.slug)))
      .then((rows) => rows[0]);

    if (existingCategory) throw new AppError(ERRORS.SLUG_ALREADY_EXISTS);

    return tx
      .insert(categories)
      .values({
        name: input.name,
        description: input.description,
        slug: slugify(input.slug),
        active: input.active ?? true,
      })
      .returning()
      .then(takeFirstOrThrow);
  });

  revalidateTag("categories");
  revalidateTag("categories-count");

  return {
    data: category,
    message: SUCCESS_MESSAGES.CATEGORY_CREATED,
  };
}

async function updateCategoryBase(
  input: UpdateCategoryActionSchema,
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  if (input.slug) {
    const existingCategory = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slugify(input.slug)))
      .then((rows) => rows[0]);

    if (existingCategory && existingCategory.id !== input.id) {
      throw new AppError(ERRORS.SLUG_ALREADY_EXISTS);
    }
  }

  const updateData = {
    name: input.name,
    description: input.description,
    slug: input.slug ? slugify(input.slug) : undefined,
    active: input.active,
    updatedAt: new Date(),
  };

  // Remove undefined values
  const cleanUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined),
  );

  const category = await db
    .update(categories)
    .set(cleanUpdateData)
    .where(eq(categories.id, input.id))
    .returning()
    .then(takeFirstOrThrow);

  revalidateTag("categories");
  revalidateTag("categories-count");

  return {
    data: category,
    message: SUCCESS_MESSAGES.CATEGORY_UPDATED,
  };
}

async function deleteCategoriesBase(
  input: { ids: string[] },
  ctx: ActionContext = {},
) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);

  await db
    .update(categories)
    .set({ active: false, updatedAt: new Date() })
    .where(inArray(categories.id, input.ids));

  revalidateTag("categories");
  revalidateTag("categories-count");

  return {
    message: SUCCESS_MESSAGES.CATEGORY_DELETED,
  };
}

export const createCategory = composeMiddleware<
  CreateCategorySchema,
  Awaited<ReturnType<typeof createCategoryBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: createCategorySchema,
    errorMessage: "Datos de categoría inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(createCategoryBase);

export const updateCategory = composeMiddleware<
  UpdateCategoryActionSchema,
  Awaited<ReturnType<typeof updateCategoryBase>>
>(
  withErrorHandling(),
  withValidation({
    schema: updateCategoryActionSchema,
    errorMessage: "Datos de categoría inválidos",
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 10,
    duration: "1m",
  }),
)(updateCategoryBase);

export const deleteCategories = composeMiddleware<
  { ids: string[] },
  Awaited<ReturnType<typeof deleteCategoriesBase>>
>(
  withErrorHandling(),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN],
  }),
  withRateLimit({
    requests: 5,
    duration: "1m",
  }),
)(deleteCategoriesBase);
