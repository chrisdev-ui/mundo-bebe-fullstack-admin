import { AuthContainer } from "@/components/layout/auth-container.server";
import { InviteAdminCard } from "@/components/layout/invite-admin-card.server";
import { checkModuleAccess } from "@/lib/auth";
import { AccessModules } from "@/types";

const AccessModule: AccessModules = "super-admin";
export default async function InviteAdminPage() {
  await checkModuleAccess(AccessModule, "admin/panel");
  return (
    <AuthContainer>
      <InviteAdminCard />
    </AuthContainer>
  );
}
