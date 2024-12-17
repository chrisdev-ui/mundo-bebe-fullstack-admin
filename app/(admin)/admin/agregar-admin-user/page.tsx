import { AdminPaths } from "@/constants";
import { checkModuleAccess } from "@/lib/auth";
import { AccessModules } from "@/types";
import { InviteAdminPage } from "./_components/invite-admin-page.server";

const AccessModule: AccessModules = "super-admin";
export default async function AddNewAdminPage() {
  await checkModuleAccess(AccessModule, AdminPaths.ADMIN_PANEL);
  return <InviteAdminPage />;
}
