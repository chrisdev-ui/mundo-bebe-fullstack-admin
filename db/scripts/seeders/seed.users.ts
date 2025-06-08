import { fakerES as faker, simpleFaker } from "@faker-js/faker";
import { hash } from "bcrypt-ts";

import db from "@/db/drizzle";
import { UserRoleValues, users, type User } from "@/db/schema";

function generateColombiandID() {
  return faker.string.numeric({ length: { min: 8, max: 10 } });
}

function generatePhoneNumber() {
  const length = faker.number.int({ min: 7, max: 7 });
  const numbers = faker.string.numeric(length);
  return `+573${numbers}`;
}

function generateUsername(firstName: string, lastName: string) {
  return faker.internet
    .username({
      firstName,
      lastName,
    })
    .toLowerCase();
}

function generateEmail(name: string, lastName: string) {
  return faker.internet.email({
    firstName: name,
    lastName,
  });
}

async function generateRandomUser(): Promise<User> {
  const saltRounds = 10;
  const plainPassword = faker.internet.password({ length: 12 });
  const hashedPassword = await hash(plainPassword, saltRounds);

  const now = new Date();
  const threeYearsAgo = new Date(
    now.getFullYear() - 3,
    now.getMonth(),
    now.getDate(),
  );
  const createdAt = faker.date.between({ from: threeYearsAgo, to: now });

  const name = faker.person.firstName();
  const lastName = faker.person.lastName();

  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);
  const dob = faker.date.between({
    from: new Date("1950-01-01"),
    to: maxBirthDate,
  });

  return {
    id: simpleFaker.string.uuid(),
    name: name,
    lastName: lastName,
    email: generateEmail(name, lastName),
    emailVerified: faker.date.between({ from: createdAt, to: now }),
    image: faker.image.avatar(),
    dob,
    phoneNumber: generatePhoneNumber(),
    documentId: generateColombiandID(),
    username: generateUsername(name, lastName),
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
    for (let i = 0; i < count; i++) {
      try {
        const user = await generateRandomUser();
        await db.insert(users).values(user).onConflictDoNothing();
      } catch (error) {
        console.error(`Failed to insert user at index ${i}:`, error);
        continue;
      }
    }

    console.log(`✅ Successfully seeded users`);
  } catch (error) {
    console.error("❌ Error seeding users", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}
