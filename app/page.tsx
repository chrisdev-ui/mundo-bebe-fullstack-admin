import Image from "next/image";
import { Link } from "next-view-transitions";

import { auth } from "@/auth";
import LogoutButton from "@/components/auth/logout-button.server";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { AuthPaths } from "@/constants";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-24">
      <div className="mx-auto size-[350px]">
        <AspectRatio ratio={1 / 1}>
          <Image
            src="/images/website_under_construction.png"
            alt="Imagen para el sitio web en construcción"
            fill
            quality={100}
            priority
            className="size-full animate-jump rounded-md object-cover"
          />
        </AspectRatio>
      </div>

      {session?.user ? (
        <>
          <h1>Hola {session?.user?.name}</h1>
          {JSON.stringify(session, null, 2)}
          <LogoutButton />
        </>
      ) : (
        <>
          <h1>Bienvenido a Pañalera Mundo Bebé J.A.</h1>
          <Button asChild>
            <Link href={AuthPaths.LOGIN}>Iniciar sesión</Link>
          </Button>
        </>
      )}
    </main>
  );
}
