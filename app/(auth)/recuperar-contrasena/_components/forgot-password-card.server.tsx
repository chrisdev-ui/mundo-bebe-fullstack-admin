import { AuthCardContainer } from "@/components/layout/auth-card-container.server";
import { ForgotPasswordForm } from "./forgot-password-form.client";

export const ForgotPasswordCard: React.FC = () => {
  return (
    <AuthCardContainer
      title="Recuperar tu contraseña"
      description="Introduce tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña"
    >
      <ForgotPasswordForm />
    </AuthCardContainer>
  );
};
