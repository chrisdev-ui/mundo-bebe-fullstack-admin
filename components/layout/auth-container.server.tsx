import Image from "next/image";

import { Container } from "@/components/layout/container.server";

interface AuthContainerProps {
  children: React.ReactNode;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ children }) => {
  return (
    <Container className="relative flex min-h-screen w-full flex-col items-center justify-center">
      <Image
        src="/images/auth_bg_mundo_bebe.webp"
        alt="Imagen de fondo para el inicio de sesión"
        fill
        quality={100}
        priority
        className="-z-50 object-cover"
      />
      {children}
    </Container>
  );
};
