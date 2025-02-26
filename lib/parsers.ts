import { Row } from "@tanstack/react-table";
import { createParser } from "nuqs/server";
import { z } from "zod";

import { dataTableConfig } from "@/config/data-table";
import type { ExtendedSortingState, Filter } from "@/types";

export const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const getSortingStateParser = <TData>(
  originalRow?: Row<TData>["original"],
) => {
  const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null;

  return createParser<ExtendedSortingState<TData>>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(sortingItemSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data as ExtendedSortingState<TData>;
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (item, index) =>
          item.id === b[index]?.id && item.desc === b[index]?.desc,
      ),
  });
};

export const filterSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  type: z.enum(dataTableConfig.columnTypes),
  operator: z.enum(dataTableConfig.globalOperators),
  rowId: z.string(),
});

export const getFiltersStateParser = <T>(originalRow?: Row<T>["original"]) => {
  const validKeys = originalRow ? new Set(Object.keys(originalRow)) : null;

  return createParser<Filter<T>[]>({
    parse: (value) => {
      try {
        const parsed = JSON.parse(value);
        const result = z.array(filterSchema).safeParse(parsed);

        if (!result.success) return null;

        if (validKeys && result.data.some((item) => !validKeys.has(item.id))) {
          return null;
        }

        return result.data as Filter<T>[];
      } catch {
        return null;
      }
    },
    serialize: (value) => JSON.stringify(value),
    eq: (a, b) =>
      a.length === b.length &&
      a.every(
        (filter, index) =>
          filter.id === b[index]?.id &&
          filter.value === b[index]?.value &&
          filter.type === b[index]?.type &&
          filter.operator === b[index]?.operator,
      ),
  });
};
