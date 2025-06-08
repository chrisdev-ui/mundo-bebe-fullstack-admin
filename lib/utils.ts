import { genSaltSync, hashSync } from "bcrypt-ts";
import { clsx, type ClassValue } from "clsx";
import { format, Locale } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import { AdminPaths, AuthPaths, ProtectedPaths } from "@/constants";
import { UserRoleValues } from "@/db/schema";
import type { NavItem, UserRole } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterNavItems(
  items: NavItem[],
  userRole: UserRole,
): NavItem[] {
  return items.filter((item) => {
    const hasAccess =
      userRole === UserRoleValues.SUPER_ADMIN ||
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
  return Object.values(UserRoleValues).includes(role as UserRole);
}

export function isAdminUser(role: UserRole) {
  return role === UserRoleValues.ADMIN || role === UserRoleValues.SUPER_ADMIN;
}

export function generatePassword(password: string, length: number = 10) {
  const salt = genSaltSync(length);
  return hashSync(password, salt);
}

/**
 * Converts a string into a URL-friendly slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} The slugified text
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "-y-")
    .replace(/\|/g, "-o-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
