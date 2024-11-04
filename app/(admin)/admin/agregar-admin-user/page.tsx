import { AuthContainer } from "@/components/layout/auth-container.server";
import { checkModuleAccess } from "@/lib/auth";
import { AccessModules } from "@/types";
import { InviteAdminCard } from "./_components/invite-admin-card.server";

const AccessModule: AccessModules = "super-admin";
export default async function InviteAdminPage() {
  await checkModuleAccess(AccessModule, "admin/panel");
  return (
    <AuthContainer>
      <InviteAdminCard />
    </AuthContainer>
  );
}
