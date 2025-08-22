import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

import { ProductType } from "@/db/schema";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    [],
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<ProductType>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  code: parseAsString.withDefault(""),
  description: parseAsString.withDefault(""),
  active: parseAsBoolean.withDefault(true),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createProductTypeSchema = z.object({
  name: z.string().min(1, "El nombre del tipo de producto es obligatorio"),
  code: z.string().min(1, "El código del tipo de producto es obligatorio"),
  description: z.string().optional(),
  active: z.boolean().optional(),
});

export const updateProductTypeSchema = createProductTypeSchema.partial();

export type CreateProductTypeSchema = z.infer<typeof createProductTypeSchema>;
export type UpdateProductTypeSchema = z.infer<typeof updateProductTypeSchema>;
export type GetProductTypesSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const updateProductTypeActionSchema = z.object({
  id: z.string(),
  ...updateProductTypeSchema.shape,
});

export type UpdateProductTypeActionSchema = z.infer<typeof updateProductTypeActionSchema>;