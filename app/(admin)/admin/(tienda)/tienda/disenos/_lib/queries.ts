import "server-only";

import { and, asc, count, desc, eq, gt, gte, ilike, lte } from "drizzle-orm";

import db from "@/db/drizzle";
import { designs } from "@/db/schema";
import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";
import { GetDesignsSchema } from "./validations";

export async function getDesigns(input: GetDesignsSchema) {
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage;
        const fromDate = input.from ? new Date(input.from) : undefined;
        const toDate = input.to ? new Date(input.to) : undefined;
        const advancedTable = input.flags.includes("advancedTable");

        const advancedWhere = filterColumns({
          table: designs,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name ? ilike(designs.name, `%${input.name}%`) : undefined,
              input.code ? ilike(designs.code, `%${input.code}%`) : undefined,
              input.description
                ? ilike(designs.description, `%${input.description}%`)
                : undefined,
              input.active ? eq(designs.active, input.active) : undefined,
              fromDate ? gte(designs.createdAt, fromDate) : undefined,
              toDate ? lte(designs.createdAt, toDate) : undefined,
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(designs[item.id]) : asc(designs[item.id]),
              )
            : [desc(designs.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(designs)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const total = await tx
            .select({ count: count() })
            .from(designs)
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
      tags: ["designs"],
    },
  )();
}

export async function getDesignsCount() {
  return await unstable_cache(
    async () => {
      try {
        return await db
          .select({
            active: designs.active,
            count: count(),
          })
          .from(designs)
          .groupBy(designs.active)
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
    ["designs-count"],
    {
      revalidate: 120,
    },
  )();
}
