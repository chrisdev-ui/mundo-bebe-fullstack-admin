import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

import { Category } from "@/db/schema";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    [],
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Category>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  slug: parseAsString.withDefault(""),
  description: parseAsString.withDefault(""),
  active: parseAsBoolean.withDefault(true),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es obligatorio"),
  description: z.string().optional(),
  slug: z.string().min(1, "El identificador de la categoría es obligatorio"),
  active: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type GetCategoriesSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const updateCategoryActionSchema = z.object({
  id: z.string(),
  ...updateCategorySchema.shape,
});

export type UpdateCategoryActionSchema = z.infer<
  typeof updateCategoryActionSchema
>;
