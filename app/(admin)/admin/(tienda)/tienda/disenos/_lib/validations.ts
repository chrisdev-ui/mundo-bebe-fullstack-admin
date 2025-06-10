import { desc } from "drizzle-orm";
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";

import { Design } from "@/db/schema";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";

export const searchParamsCache = createSearchParamsCache({
  flags: parseAsArrayOf(z.enum(["advancedTable", "floatingBar"])).withDefault(
    [],
  ),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Design>().withDefault([
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

export const createDesignSchema = z.object({
  name: z.string().min(1, "El nombre del diseño es obligatorio"),
  code: z.string().min(1, "El código del diseño es obligatorio"),
  description: z.string().optional(),
  active: z.boolean().optional(),
});

export const updateDesignSchema = createDesignSchema.partial();
export type CreateDesignSchema = z.infer<typeof createDesignSchema>;
export type UpdateDesignSchema = z.infer<typeof updateDesignSchema>;
export type GetDesignsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;

export const updateDesignActionSchema = z.object({
  id: z.string(),
  ...updateDesignSchema.shape,
});

export type UpdateDesignActionSchema = z.infer<typeof updateDesignActionSchema>;
