import { genSaltSync, hashSync } from "bcrypt-ts";
import { clsx, type ClassValue } from "clsx";
import { format, Locale } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import { AdminPaths, AuthPaths, ProtectedPaths } from "@/constants";
import { NavItem, type UserRole } from "@/types";
import { UserRole as UserRoleEnum } from "@/types/enum";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterNavItems(
  items: NavItem[],
  userRole: UserRole,
): NavItem[] {
  return items.filter((item) => {
    const hasAccess =
      userRole === UserRoleEnum.SUPER_ADMIN ||
      item.accessLevel.includes(userRole);
    if (hasAccess && item.items) {
      item.items = filterNavItems(item.items, userRole);
    }
    return hasAccess;
  });
}

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
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

export function formatCaption(
  date: Date,
  options:
    | {
        locale?: Locale;
      }
    | undefined,
) {
  return format(date, "MMMM yyyy", { locale: es });
}

export function formatMonthCaption(
  date: Date,
  options:
    | {
        locale?: Locale;
      }
    | undefined,
) {
  return format(date, "MMMM", { locale: es }).replace(/^\w/, (c) =>
    c.toUpperCase(),
  );
}

export function isValidUserRole(role: string): boolean {
  return Object.values(UserRoleEnum).includes(role as UserRole);
}

export function isAdminUser(role: UserRole) {
  return role === UserRoleEnum.ADMIN || role === UserRoleEnum.SUPER_ADMIN;
}

export function generatePassword(password: string, length: number = 10) {
  const salt = genSaltSync(length);
  return hashSync(password, salt);
}
