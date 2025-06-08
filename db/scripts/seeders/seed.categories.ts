import { fakerES as faker, simpleFaker } from "@faker-js/faker";

import db from "@/db/drizzle";
import { categories, type Category } from "@/db/schema";
import { slugify } from "@/lib/utils";

function generateCategory(): Category {
  const now = new Date();
  const threeMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 3,
    now.getDate(),
  );
  const createdAt = faker.date.between({ from: threeMonthsAgo, to: now });

  const name = faker.commerce.department();

  return {
    id: simpleFaker.string.uuid(),
    name,
    slug: slugify(name),
    description: faker.commerce.productDescription(),
    active: faker.datatype.boolean({ probability: 0.9 }),
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: now }),
  };
}

export async function seedCategories(input: { count: number }) {
  const count = input.count ?? 10;

  try {
    const essentialCategories: Omit<Category, "id">[] = [
      {
        name: "Ropa de Bebé",
        slug: "ropa-de-bebe",
        description: "Todo tipo de ropa para bebés y niños pequeños",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Accesorios",
        slug: "accesorios",
        description: "Accesorios esenciales para bebés",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Juguetes",
        slug: "juguetes",
        description: "Juguetes educativos y recreativos",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Alimentación",
        slug: "alimentacion",
        description: "Productos para la alimentación del bebé",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Higiene y Cuidado",
        slug: "higiene-y-cuidado",
        description: "Productos para el cuidado e higiene del bebé",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert essential categories first
    for (const category of essentialCategories) {
      await db
        .insert(categories)
        .values({
          ...category,
          id: simpleFaker.string.uuid(),
        })
        .onConflictDoNothing();
    }

    // Generate random categories
    for (let i = 0; i < count - essentialCategories.length; i++) {
      try {
        const category = generateCategory();
        await db.insert(categories).values(category).onConflictDoNothing();
      } catch (error) {
        console.error(`Failed to insert category at index ${i}:`, error);
        continue;
      }
    }

    console.log(`✅ Successfully seeded categories`);
  } catch (error) {
    console.error("❌ Error seeding categories", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw error;
  }
}
