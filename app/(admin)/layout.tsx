import { createModuleAccessChecker } from "@/lib/auth";
import { AccessModules } from "@/types";

const AccessModule: AccessModules = "admin";
const checkAdminAccess = createModuleAccessChecker(AccessModule, "/");

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdminAccess();
  return children;
}
