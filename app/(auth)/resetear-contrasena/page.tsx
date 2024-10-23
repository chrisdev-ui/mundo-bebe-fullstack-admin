import { AuthContainer } from "@/components/layout/auth-container.server";
import { ResetPasswordCard } from "@/components/layout/reset-password-card.server";

export default function ResetPasswordPage() {
  return (
    <AuthContainer>
      <ResetPasswordCard />
    </AuthContainer>
  );
}
