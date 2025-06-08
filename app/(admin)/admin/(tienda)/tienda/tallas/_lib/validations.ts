import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

import { Size } from "@/db/schema";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    [],
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Size>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  code: parseAsString.withDefault(""),
  active: parseAsBoolean.withDefault(true),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export const createSizeSchema = z.object({
  name: z.string().min(1, "El nombre de la talla es obligatorio"),
  code: z.string().min(1, "El código de la talla es obligatorio"),
  active: z.boolean().optional(),
});

export const updateSizeSchema = createSizeSchema.partial();
export type CreateSizeSchema = z.infer<typeof createSizeSchema>;
export type UpdateSizeSchema = z.infer<typeof updateSizeSchema>;
export type GetSizesSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const updateSizeActionSchema = z.object({
  id: z.string(),
  ...updateSizeSchema.shape,
});

export type UpdateSizeActionSchema = z.infer<typeof updateSizeActionSchema>;
