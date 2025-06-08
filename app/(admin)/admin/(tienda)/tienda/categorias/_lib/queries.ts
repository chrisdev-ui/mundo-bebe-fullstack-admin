import "server-only";

import { and, asc, count, desc, eq, gt, gte, ilike, lte } from "drizzle-orm";

import db from "@/db/drizzle";
import { categories } from "@/db/schema";
import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";
import { GetCategoriesSchema } from "./validations";

export async function getCategories(input: GetCategoriesSchema) {
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage;
        const fromDate = input.from ? new Date(input.from) : undefined;
        const toDate = input.to ? new Date(input.to) : undefined;
        const advancedTable = input.flags.includes("advancedTable");

        const advancedWhere = filterColumns({
          table: categories,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name
                ? ilike(categories.name, `%${input.name}%`)
                : undefined,
              input.slug
                ? ilike(categories.slug, `%${input.slug}%`)
                : undefined,
              input.description
                ? ilike(categories.description, `%${input.description}%`)
                : undefined,
              input.active ? eq(categories.active, input.active) : undefined,
              fromDate ? gte(categories.createdAt, fromDate) : undefined,
              toDate ? lte(categories.createdAt, toDate) : undefined,
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc
                  ? desc(categories[item.id])
                  : asc(categories[item.id]),
              )
            : [desc(categories.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(categories)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const total = await tx
            .select({
              count: count(),
            })
            .from(categories)
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
      tags: ["categories"],
    },
  )();
}

export async function getCategoriesCount() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            active: categories.active,
            count: count(),
          })
          .from(categories)
          .groupBy(categories.active)
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
      } catch (_err) {
        return { active: 0, inactive: 0 };
      }
    },
    ["categories-count"],
    {
      revalidate: 120,
    },
  )();
}
