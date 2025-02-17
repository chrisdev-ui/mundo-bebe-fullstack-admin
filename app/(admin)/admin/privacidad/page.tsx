import { AdminPaths } from "@/constants";
import { checkModuleAccess } from "@/lib/auth";
import { AccessModules } from "@/types";
import { PrivacidadPage } from "./_components/privacidad-page.server";

const AccessModule: AccessModules = "admin";
export default async function Page() {
  await checkModuleAccess(AccessModule, AdminPaths.ADMIN_PANEL);
  return <PrivacidadPage />;
}
