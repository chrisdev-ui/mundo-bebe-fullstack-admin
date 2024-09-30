import { eq, or } from "drizzle-orm";

import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { User } from "@/types";

export async function getUserByEmailOrUsername(
  username: string,
): Promise<User | undefined> {
  try {
    const user = await db.query.users.findFirst({
      where: or(eq(users.email, username), eq(users.username, username)),
    });

    return user;
  } catch (error) {
    console.error("Error getting user by email or username", error);
    throw error;
  }
}
