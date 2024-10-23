import { ResetPasswordForm } from "@/components/form/reset-password-form.client";
import { AuthCardContainer } from "@/components/layout/auth-card-container.server";

export const ResetPasswordCard: React.FC = () => {
  return (
    <AuthCardContainer
      title="Restablecer contraseña"
      description="Crea una nueva contraseña para tu cuenta"
    >
      <ResetPasswordForm />
    </AuthCardContainer>
  );
};
