import { AuthContainer } from "@/components/layout/auth-container.server";
import { ForgotPasswordCard } from "./_components/forgot-password-card.server";

export default function ForgotPasswordPage() {
  return (
    <AuthContainer>
      <ForgotPasswordCard />
    </AuthContainer>
  );
}
