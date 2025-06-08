import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lte,
  sql,
} from "drizzle-orm";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { User, UserRoleValues, users } from "@/db/schema";
import { filterColumns } from "@/lib/filter-columns";
import { unstable_cache } from "@/lib/unstable-cache";
import { GetUsersSchema } from "./validations";

export async function getUsers(input: GetUsersSchema) {
  const session = await auth();
  return await unstable_cache(
    async () => {
      try {
        const userRole = session?.user?.role;
        const currentUserId = session?.user?.id;

        const offset = (input.page - 1) * input.perPage;
        const fromDate = input.from ? new Date(input.from) : undefined;
        const toDate = input.to ? new Date(input.to) : undefined;
        const advancedTable = input.flags.includes("advancedTable");

        const advancedWhere = filterColumns({
          table: users,
          filters: input.filters,
          joinOperator: input.joinOperator,
        });

        const roleFilter =
          userRole && userRole === UserRoleValues.ADMIN
            ? and(
                sql`${users.role} != ${UserRoleValues.ADMIN}`,
                sql`${users.role} != ${UserRoleValues.SUPER_ADMIN}`,
                sql`${users.id} != ${currentUserId}`,
              )
            : sql`${users.id} != ${currentUserId}`;

        const where = advancedTable
          ? and(advancedWhere, roleFilter)
          : and(
              roleFilter,
              input.name
                ? sql`${users.name} || ' ' || ${users.lastName} ILIKE ${"%" + input.name + "%"}`
                : undefined,
              input.username
                ? ilike(users.username, input.username)
                : undefined,
              input.email ? ilike(users.email, input.email) : undefined,
              input.phone ? ilike(users.phoneNumber, input.phone) : undefined,
              input.documentId
                ? ilike(users.documentId, input.documentId)
                : undefined,
              input.active ? eq(users.active, input.active) : undefined,
              input.role.length > 0
                ? inArray(users.role, input.role)
                : undefined,
              fromDate ? gte(users.createdAt, fromDate) : undefined,
              toDate ? lte(users.createdAt, toDate) : undefined,
            );

        const orderBy =
          input.sort.length > 0
            ? input.sort.map((item) =>
                item.desc ? desc(users[item.id]) : asc(users[item.id]),
              )
            : [asc(users.createdAt)];

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(users)
            .limit(input.perPage)
            .offset(offset)
            .where(where)
            .orderBy(...orderBy);

          const total = await tx
            .select({
              count: count(),
            })
            .from(users)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          return { data, total };
        });

        const pageCount = Math.ceil(total / input.perPage);

        return { data, pageCount };
      } catch (_error) {
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 120,
      tags: ["users"],
    },
  )();
}

export async function getUserRolesCounts() {
  return unstable_cache(
    async () => {
      try {
        return await db
          .select({
            role: users.role,
            count: count(),
          })
          .from(users)
          .groupBy(users.role)
          .having(gt(count(), 0))
          .then((res) =>
            res.reduce(
              (acc, { role, count }) => {
                acc[role] = count;
                return acc;
              },
              {} as Record<User["role"], number>,
            ),
          );
      } catch (_err) {
        return {} as Record<User["role"], number>;
      }
    },
    ["user-role-counts"],
    {
      revalidate: 120,
    },
  )();
}
