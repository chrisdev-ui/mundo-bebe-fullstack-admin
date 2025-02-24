import { seedUsers } from "./seed.users";

async function runSeed() {
  console.log("⏳ Running seed...");

  const start = Date.now();

  await seedUsers({ count: 100 });

  const end = Date.now();

  console.log(`✅ Seed finished in ${end - start}ms`);

  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Seed failed");
  console.error(err);
  process.exit(1);
});
