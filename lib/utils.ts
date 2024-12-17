import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  AdminPaths,
  AuthPaths,
  NEXT_AUTH_PATHNAME,
  ProtectedPaths,
  PublicPaths,
  UNDERSCORE_NEXT_PATHNAME,
} from "@/constants";
import { NavItem, UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterNavItems(
  items: NavItem[],
  userRole: UserRole,
): NavItem[] {
  return items.filter((item) => {
    const hasAccess =
      userRole === UserRole.SUPER_ADMIN || item.accessLevel.includes(userRole);
    if (hasAccess && item.items) {
      item.items = filterNavItems(item.items, userRole);
    }
    return hasAccess;
  });
}

export function isNextPath(pathname: string): boolean {
  const allowedPaths = [NEXT_AUTH_PATHNAME, UNDERSCORE_NEXT_PATHNAME].join("|");
  const pathRegexp = new RegExp(`^(?:${allowedPaths})`, "g");
  return pathname.match(pathRegexp) !== null;
}

export function isPublicPath(path: string): boolean {
  const publicPaths = [...Object.values(PublicPaths)].join("|");
  const pathRegexp = new RegExp(`^(?:${publicPaths})`, "g");
  return path.match(pathRegexp) !== null;
}

export function isProtectedPath(path: string): boolean {
  const protectedPaths = [...Object.values(ProtectedPaths)].join("|");
  const pathRegexp = new RegExp(`^(?:${protectedPaths})`, "g");
  return path.match(pathRegexp) !== null;
}

export function isAuthFlowPath(path: string): boolean {
  const authFlowPaths = [...Object.values(AuthPaths)].join("|");
  const pathRegexp = new RegExp(`^(?:${authFlowPaths})`, "g");
  return path.match(pathRegexp) !== null;
}

export function isAdminPath(path: string): boolean {
  const adminPaths = [...Object.values(AdminPaths)].join("|");
  const pathRegexp = new RegExp(`^(?:${adminPaths})`, "g");
  return path.match(pathRegexp) !== null;
}
