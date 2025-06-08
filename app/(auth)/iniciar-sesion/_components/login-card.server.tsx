import { Suspense } from "react";

import { AuthCardContainer } from "@/components/layout/auth-card-container.server";
import { LoginForm } from "./login-form.client";

export const LoginCard: React.FC = () => {
  return (
    <AuthCardContainer
      title="Iniciar sesión"
      description="Introduce tu información para acceder a tu cuenta"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCardContainer>
  );
};
