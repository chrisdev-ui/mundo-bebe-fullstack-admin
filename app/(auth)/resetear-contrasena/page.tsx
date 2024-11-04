import { AuthContainer } from "@/components/layout/auth-container.server";
import { ResetPasswordCard } from "./_components/reset-password-card.server";

export default function ResetPasswordPage() {
  return (
    <AuthContainer>
      <ResetPasswordCard />
    </AuthContainer>
  );
}
