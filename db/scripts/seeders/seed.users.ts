import { fakerES_MX as faker, simpleFaker } from "@faker-js/faker";
import { hash } from "bcrypt-ts";

import db from "@/db/drizzle";
import { users, type User } from "@/db/schema";
import { UserRole } from "@/types/enum";

async function generateRandomUser(): Promise<User> {
  const saltRounds = 10;
  const plainPassword = faker.internet.password();
  const hashedPassword = await hash(plainPassword, saltRounds);

  return {
    id: simpleFaker.string.uuid(),
    name: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    emailVerified: faker.date.past(),
    image: faker.image.avatar(),
    dob: faker.date.birthdate(),
    phoneNumber: faker.phone.number({
      style: "international",
    }),
    username: faker.internet.displayName(),
    password: hashedPassword,
    role: UserRole.USER,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };
}

export async function seedUsers(input: { count: number }) {
  const count = input.count ?? 100;

  try {
    const allUsers: User[] = [];

    for (let i = 0; i < count; i++) {
      const user = await generateRandomUser();
      allUsers.push(user);
    }

    console.log("⏳ Seeding users...", allUsers.length);

    await db.insert(users).values(allUsers).onConflictDoNothing();
  } catch (error) {
    console.error("❌ Error seeding users", error);
  }
}
