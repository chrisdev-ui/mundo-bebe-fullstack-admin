import { ForgotPasswordForm } from "@/components/form/forgot-password-form.client";
import { AuthCardContainer } from "./auth-card-container.server";

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
