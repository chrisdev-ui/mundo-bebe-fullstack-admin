import { LoginForm } from "@/components/form/login-form.client";
import { AuthCardContainer } from "./auth-card-container.server";

export const LoginCard: React.FC = () => {
  return (
    <AuthCardContainer
      title="Iniciar sesión"
      description="Introduce tu información para acceder a tu cuenta"
    >
      <LoginForm />
    </AuthCardContainer>
  );
};
