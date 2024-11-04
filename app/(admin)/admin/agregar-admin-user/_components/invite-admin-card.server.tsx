import { AuthCardContainer } from "@/components/layout/auth-card-container.server";
import { InviteAdminForm } from "./invite-admin-form.client";

export const InviteAdminCard: React.FC = () => {
  return (
    <AuthCardContainer
      title="Invitar un administrador"
      description="Invita a un usuario a ser administrador"
    >
      <InviteAdminForm />
    </AuthCardContainer>
  );
};
