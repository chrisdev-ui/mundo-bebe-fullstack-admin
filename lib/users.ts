import "server-only";

import { eq, or } from "drizzle-orm";

import db from "@/db/drizzle";
import { users, type User } from "@/db/schema";

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

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return user;
  } catch (error) {
    console.error("Error getting user by id", error);
    throw error;
  }
}
