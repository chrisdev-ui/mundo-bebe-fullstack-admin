import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  console.log(session);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"></main>
  );
}
