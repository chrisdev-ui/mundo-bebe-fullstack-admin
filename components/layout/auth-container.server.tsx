import Image from "next/image";

import { Container } from "@/components/layout/container.server";
import { ScrollArea } from "../ui/scroll-area";

interface AuthContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  scrollable = true,
}) => {
  return scrollable ? (
    <ScrollArea className="h-dvh">
      <Container className="relative flex min-h-screen w-full flex-col items-center justify-center py-10">
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
    </ScrollArea>
  ) : (
    <Container className="relative flex min-h-screen w-full flex-col items-center justify-center py-10">
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
