import "server-only";

import { and, asc, count, desc, eq, gt, gte, ilike, lte } from "drizzle-orm";

import db from "@/db/drizzle";
import { productTypes } from "@/db/schema";
import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";
import { GetProductTypesSchema } from "./validations";

export async function getProductTypes(input: GetProductTypesSchema) {
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage;
        const fromDate = input.from ? new Date(input.from) : undefined;
        const toDate = input.to ? new Date(input.to) : undefined;
        const advancedTable = input.flags.includes("advancedTable");

        const advancedWhere = filterColumns({
          table: productTypes,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name ? ilike(productTypes.name, `%${input.name}%`) : undefined,
              input.code ? ilike(productTypes.code, `%${input.code}%`) : undefined,
              input.description
                ? ilike(productTypes.description, `%${input.description}%`)
                : undefined,
              input.active ? eq(productTypes.active, input.active) : undefined,
              fromDate ? gte(productTypes.createdAt, fromDate) : undefined,
              toDate ? lte(productTypes.createdAt, toDate) : undefined,
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(productTypes[item.id]) : asc(productTypes[item.id]),
              )
            : [desc(productTypes.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(productTypes)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const total = await tx
            .select({ count: count() })
            .from(productTypes)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          return { data, total };
        });

        const pageCount = Math.ceil(total / input.perPage);

        return { data, pageCount };
      } catch (error) {
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 120,
      tags: ["product-types"],
    },
  )();
}

export async function getProductTypesCount() {
  return await unstable_cache(
    async () => {
      try {
        return await db
          .select({
            active: productTypes.active,
            count: count(),
          })
          .from(productTypes)
          .groupBy(productTypes.active)
          .having(gt(count(), 0))
          .then((res) =>
            res.reduce(
              (acc, { active, count }) => {
                acc[active ? "active" : "inactive"] = count;
                return acc;
              },
              { active: 0, inactive: 0 },
            ),
          );
      } catch (error) {
        return { active: 0, inactive: 0 };
      }
    },
    ["product-types-count"],
    {
      revalidate: 120,
    },
  )();
}