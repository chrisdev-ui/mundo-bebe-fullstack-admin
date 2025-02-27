import { fakerES_MX as faker, simpleFaker } from "@faker-js/faker";
import { hash } from "bcrypt-ts";

import db from "@/db/drizzle";
import { UserRoleValues, users, type User } from "@/db/schema";

function generateColombiandID() {
  return faker.string.numeric({ length: { min: 8, max: 10 } });
}

async function generateRandomUser(): Promise<User> {
  const saltRounds = 10;
  const plainPassword = faker.internet.password();
  const hashedPassword = await hash(plainPassword, saltRounds);

  const now = new Date();
  const createdAt = faker.date.past();

  return {
    id: simpleFaker.string.uuid(),
    name: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    emailVerified: faker.date.between({ from: createdAt, to: now }),
    image: faker.image.avatar(),
    dob: faker.date.birthdate(),
    phoneNumber: faker.phone.number({
      style: "international",
    }),
    documentId: generateColombiandID(),
    username: faker.internet.username(),
    password: hashedPassword,
    role: UserRoleValues.USER,
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: now }),
    active: faker.datatype.boolean({ probability: 0.9 }),
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
