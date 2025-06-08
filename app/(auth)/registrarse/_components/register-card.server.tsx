import { Suspense } from "react";

import { AuthCardContainer } from "@/components/layout/auth-card-container.server";
import { RegisterForm } from "./register-form.client";

export const RegisterCard: React.FC = () => {
  return (
    <AuthCardContainer
      title="Registrarse"
      description="Introduce tu información para crear una cuenta"
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthCardContainer>
  );
};
