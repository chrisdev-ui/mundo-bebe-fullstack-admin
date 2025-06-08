import "server-only";

import { and, asc, count, desc, eq, gt, gte, ilike, lte } from "drizzle-orm";

import db from "@/db/drizzle";
import { sizes } from "@/db/schema";
import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";
import { GetSizesSchema } from "./validations";

export async function getSizes(input: GetSizesSchema) {
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage;
        const fromDate = input.from ? new Date(input.from) : undefined;
        const toDate = input.to ? new Date(input.to) : undefined;
        const advancedTable = input.flags.includes("advancedTable");

        const advancedWhere = filterColumns({
          table: sizes,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name ? ilike(sizes.name, `%${input.name}%`) : undefined,
              input.code ? ilike(sizes.code, `%${input.code}%`) : undefined,
              input.active ? eq(sizes.active, input.active) : undefined,
              fromDate ? gte(sizes.createdAt, fromDate) : undefined,
              toDate ? lte(sizes.createdAt, toDate) : undefined,
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(sizes[item.id]) : asc(sizes[item.id]),
              )
            : [desc(sizes.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(sizes)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const total = await tx
            .select({ count: count() })
            .from(sizes)
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
      tags: ["sizes"],
    },
  )();
}

export async function getSizesCount() {
  return await unstable_cache(
    async () => {
      try {
        return await db
          .select({
            active: sizes.active,
            count: count(),
          })
          .from(sizes)
          .groupBy(sizes.active)
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
    ["sizes-count"],
    {
      revalidate: 120,
    },
  )();
}
