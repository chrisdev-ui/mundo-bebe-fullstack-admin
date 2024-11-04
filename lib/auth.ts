import { permanentRedirect } from "next/navigation";

import { auth } from "@/auth";
import { AccessModules } from "@/types";

const roleAccessMap: Record<string, AccessModules[]> = {
  user: ["user", "guest"],
  admin: ["admin", "user", "guest"],
  super_admin: ["super-admin", "admin", "user", "guest"],
};

export async function checkModuleAccess(
  accessModule: AccessModules,
  redirectPath: string = "/",
): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    permanentRedirect(redirectPath);
  }

  const userRole =
    session.user.role.toLowerCase() as keyof typeof roleAccessMap;

  if (!userRole || !(userRole in roleAccessMap)) {
    console.error(`El rol de usuario ${session.user.role} no está definido.`);
    permanentRedirect(redirectPath);
  }

  if (!roleAccessMap[userRole].includes(accessModule)) {
    console.warn(
      `El usuario ${session.user.id} no tiene acceso al módulo ${accessModule}.`,
    );
    permanentRedirect(redirectPath);
  }

  return true;
}

export function createModuleAccessChecker(
  accessModule: AccessModules,
  redirectPath?: string,
) {
  return () => checkModuleAccess(accessModule, redirectPath);
}
