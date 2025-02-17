import { pgTable, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const userRole = pgEnum("user_role", ['USER', 'GUEST', 'ADMIN', 'SUPER_ADMIN'])




