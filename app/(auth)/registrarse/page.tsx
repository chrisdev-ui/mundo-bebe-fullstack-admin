import Image from "next/image";

import { RegisterCard } from "@/components/layout/register-card";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center">
      <Image
        src="/images/auth_bg_mundo_bebe.webp"
        alt="Imagen de fondo para el inicio de sesión"
        fill
        quality={100}
        priority
        className="-z-50 object-cover"
      />
      <RegisterCard />
    </main>
  );
}
