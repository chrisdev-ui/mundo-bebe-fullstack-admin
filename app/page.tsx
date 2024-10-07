import { auth } from "@/auth";
import LogoutButton from "@/components/auth/logout-button";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1>Hola {session?.user?.name}</h1>
      {JSON.stringify(session, null, 2)}
      <LogoutButton />
    </main>
  );
}
