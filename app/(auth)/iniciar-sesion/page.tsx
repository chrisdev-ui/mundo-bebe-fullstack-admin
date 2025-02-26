import { AuthContainer } from "@/components/layout/auth-container.server";
import { LoginCard } from "./_components/login-card.server";

export default function LoginPage() {
  return (
    <AuthContainer>
      <LoginCard />
    </AuthContainer>
  );
}
