import { AdminPaths } from "@/constants";
import { checkModuleAccess } from "@/lib/auth";
import { AccessModules } from "@/types";
import { EditarPerfilPage } from "./_components/editar-perfil-page.server";

const AccessModule: AccessModules = "admin";
export default async function Page() {
  await checkModuleAccess(AccessModule, AdminPaths.ADMIN_PANEL);
  return <EditarPerfilPage />;
}
