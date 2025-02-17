import { z } from "zod";

import { Icons } from "@/components/icons";
import { MODULES } from "@/constants";
import { authUserSelect, userSelect } from "@/server/schemas";

export enum UserRole {
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  USER = "USER",
  GUEST = "GUEST",
}

export interface NavItem {
  title: string;
  url?: string;
  action?: "logout" | null;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  accessLevel: UserRole[];
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export type User = z.infer<typeof userSelect>;

export type BreadcrumbItem = {
  title: string;
  link: string;
};

export type Breadcrumbs = BreadcrumbItem[];

export type RouteMap = Record<string, Breadcrumbs>;

export type AuthUser = z.infer<typeof authUserSelect>;

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export type LoadingState = {
  isLoading: boolean;
  text: string;
};

export type AccessModules = (typeof MODULES)[number];

export interface CustomDate {
  name: string;
  from: Date;
  to: Date;
}
