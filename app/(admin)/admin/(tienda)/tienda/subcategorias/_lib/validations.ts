import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

import { Subcategory } from "@/db/schema";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import { getSubcategories } from "./queries";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    [],
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Subcategory>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  slug: parseAsString.withDefault(""),
  description: parseAsString.withDefault(""),
  categoryId: parseAsString.withDefault(""),
  active: parseAsBoolean.withDefault(true),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createSubcategorySchema = z.object({
  name: z.string().min(1, "El nombre de la subcategoría es obligatorio"),
  description: z.string().optional(),
  slug: z.string().min(1, "El identificador de la subcategoría es obligatorio"),
  categoryId: z.string().min(1, "La categoría es obligatoria"),
  active: z.boolean().optional(),
});

export const updateSubcategorySchema = createSubcategorySchema.partial();

export type CreateSubcategorySchema = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategorySchema = z.infer<typeof updateSubcategorySchema>;
export type GetSubcategoriesSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const updateSubcategoryActionSchema = z.object({
  id: z.string(),
  ...updateSubcategorySchema.shape,
});

export type UpdateSubcategoryActionSchema = z.infer<
  typeof updateSubcategoryActionSchema
>;

export type TableSubCategory = Awaited<
  ReturnType<typeof getSubcategories>
>["data"][number];
