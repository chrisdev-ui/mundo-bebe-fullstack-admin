import "server-only";

import { and, asc, count, desc, eq, gt, gte, ilike, lte } from "drizzle-orm";

import db from "@/db/drizzle";
import { categories, subcategories } from "@/db/schema";
import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";
import { GetSubcategoriesSchema } from "./validations";

export async function getSubcategories(input: GetSubcategoriesSchema) {
  return await unstable_cache(
    async () => {
      try {
        const offset = (input.page - 1) * input.perPage;
        const fromDate = input.from ? new Date(input.from) : undefined;
        const toDate = input.to ? new Date(input.to) : undefined;
        const advancedTable = input.flags.includes("advancedTable");

        const advancedWhere = filterColumns({
          table: subcategories,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const where = advancedTable
          ? advancedWhere
          : and(
              input.name
                ? ilike(subcategories.name, `%${input.name}%`)
                : undefined,
              input.slug
                ? ilike(subcategories.slug, `%${input.slug}%`)
                : undefined,
              input.description
                ? ilike(subcategories.description, `%${input.description}%`)
                : undefined,
              input.categoryId
                ? eq(subcategories.categoryId, input.categoryId)
                : undefined,
              input.active ? eq(subcategories.active, input.active) : undefined,
              fromDate ? gte(subcategories.createdAt, fromDate) : undefined,
              toDate ? lte(subcategories.createdAt, toDate) : undefined,
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc
                  ? desc(subcategories[item.id])
                  : asc(subcategories[item.id]),
              )
            : [desc(subcategories.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select({
              id: subcategories.id,
              name: subcategories.name,
              slug: subcategories.slug,
              description: subcategories.description,
              active: subcategories.active,
              categoryId: subcategories.categoryId,
              createdAt: subcategories.createdAt,
              updatedAt: subcategories.updatedAt,
              category: {
                id: categories.id,
                name: categories.name,
              },
            })
            .from(subcategories)
            .leftJoin(categories, eq(subcategories.categoryId, categories.id))
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const total = await tx
            .select({
              count: count(),
            })
            .from(subcategories)
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
      tags: ["subcategories"],
    },
  )();
}

export async function getSubcategoriesCount() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            active: subcategories.active,
            count: count(),
          })
          .from(subcategories)
          .groupBy(subcategories.active)
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
    ["subcategories-count"],
    {
      revalidate: 120,
    },
  )();
}

export async function getActiveCategories() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            id: categories.id,
            name: categories.name,
          })
          .from(categories)
          .where(eq(categories.active, true))
          .orderBy(asc(categories.name));
      } catch (_err) {
        return [];
      }
    },
    ["active-categories"],
    {
      revalidate: 120,
    },
  )();
}
