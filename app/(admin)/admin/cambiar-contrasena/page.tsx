import { AdminPaths } from "@/constants";
import { checkModuleAccess } from "@/lib/auth";
import { AccessModules } from "@/types";
import { CambiarContrasenaPage } from "./_components/cambiar-contrasena-page.server";

const AccessModule: AccessModules = "admin";
export default async function Page() {
  await checkModuleAccess(AccessModule, AdminPaths.ADMIN_PANEL);
  return <CambiarContrasenaPage />;
}
