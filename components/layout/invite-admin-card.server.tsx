import { InviteAdminForm } from "@/components/form/invite-admin-form.client";
import { AuthCardContainer } from "./auth-card-container.server";

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
