"use client";

import { useEffect, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";

import { Container } from "@/components/layout/container.server";

interface ForbiddenProps {
  redirectTimeout?: number;
}

export const Forbidden: React.FC<ForbiddenProps> = ({
  redirectTimeout = 5,
}) => {
  const router = useTransitionRouter();
  const [seconds, setSeconds] = useState<number>(redirectTimeout);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);

    if (seconds === 0) {
      router.push("/");
    }

    return () => clearInterval(interval);
  }, [router, seconds]);

  return (
    <Container>
      <div>
        <div>Imagen de error</div>
        <h2>403 - Acceso denegado</h2>
        <p>No tienes acceso a esta página</p>
        <p>
          <span>Seras redirigido al inicio en {seconds} segundos</span>
        </p>
      </div>
    </Container>
  );
};
