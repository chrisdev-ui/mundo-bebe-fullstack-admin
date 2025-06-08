import { Suspense } from "react";

import { AuthCardContainer } from "@/components/layout/auth-card-container.server";
import { ResetPasswordForm } from "./reset-password-form.client";

export const ResetPasswordCard: React.FC = () => {
  return (
    <AuthCardContainer
      title="Restablecer contraseña"
      description="Crea una nueva contraseña para tu cuenta"
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthCardContainer>
  );
};
