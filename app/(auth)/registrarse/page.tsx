import { AuthContainer } from "@/components/layout/auth-container.server";
import { RegisterCard } from "./_components/register-card.server";

export default function RegisterPage() {
  return (
    <AuthContainer>
      <RegisterCard />
    </AuthContainer>
  );
}
