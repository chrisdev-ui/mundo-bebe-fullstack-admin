import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

import { Color } from "@/db/schema";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    [],
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Color>().withDefault([
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

export const createColorSchema = z.object({
  name: z.string().min(1, "El nombre del color es obligatorio"),
  code: z.string().min(1, "El código del color es obligatorio"),
  active: z.boolean().optional(),
});

export const updateColorSchema = createColorSchema.partial();
export type CreateColorSchema = z.infer<typeof createColorSchema>;
export type UpdateColorSchema = z.infer<typeof updateColorSchema>;
export type GetColorsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const updateColorActionSchema = z.object({
  id: z.string(),
  ...updateColorSchema.shape,
});

export type UpdateColorActionSchema = z.infer<typeof updateColorActionSchema>;
