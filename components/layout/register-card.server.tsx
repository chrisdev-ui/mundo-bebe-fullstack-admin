import { RegisterForm } from "@/components/form/register-form.client";
import { AuthCardContainer } from "./auth-card-container.server";

export const RegisterCard: React.FC = () => {
  return (
    <AuthCardContainer
      title="Registrarse"
      description="Introduce tu información para crear una cuenta"
    >
      <RegisterForm />
    </AuthCardContainer>
  );
};
