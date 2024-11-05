import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
