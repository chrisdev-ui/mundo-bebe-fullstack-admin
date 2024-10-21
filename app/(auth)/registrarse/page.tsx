import { AuthContainer } from "@/components/layout/auth-container.server";
import { RegisterCard } from "@/components/layout/register-card.server";

export default function RegisterPage() {
  return (
    <AuthContainer>
      <RegisterCard />
    </AuthContainer>
  );
}
