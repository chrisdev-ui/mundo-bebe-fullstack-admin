"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  IconBell,
  IconCreditCard,
  IconLogout,
  IconRosetteDiscountCheck,
  IconSelector,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { Link } from "next-view-transitions";

import { Breadcrumbs } from "@/components/breadcrumbs.client";
import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/layout/theme-toggle.client";
import { UserNav } from "@/components/layout/user-nav.client";
import { SearchInput } from "@/components/search-input.client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Company, navItems } from "@/constants";
import { logout } from "@/lib/actions";
import { cn, filterNavItems } from "@/lib/utils";
import type { UserRole } from "@/types";
import { AspectRatio } from "../ui/aspect-ratio";

export const AppSidebar: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const filteredNavItems = filterNavItems(
    navItems,
    session?.user.role as UserRole,
  );

  const isLoading = status === "loading";

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex gap-2 py-2 text-sidebar-accent-foreground">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
              <AspectRatio ratio={1 / 1}>
                <Image
                  src="/images/logo_mundo_bebe.svg"
                  alt={`Logo de ${Company.name}`}
                  fill
                  className="object-cover"
                  priority
                  quality={100}
                />
              </AspectRatio>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{Company.name}</span>
              <span className="truncate text-xs">{Company.acronym}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarMenu>
              {isLoading
                ? Array.from({ length: 5 }, (_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))
                : filteredNavItems.map((item) => {
                    const Icon = item.icon ? Icons[item.icon] : Icons.item;
                    return item?.items && item.items.length > 0 ? (
                      <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={pathname === item.url}
                            >
                              {item.icon && Icon && <Icon />}
                              <span>{item.title}</span>
                              <Icons.chevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => {
                                const Icon = subItem.icon
                                  ? Icons[subItem.icon]
                                  : Icons.item;
                                return (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <SidebarMenuSubButton
                                      asChild={!!subItem.url}
                                      isActive={pathname === subItem.url}
                                      className={cn({
                                        "cursor-pointer":
                                          subItem.action != null,
                                      })}
                                      onClick={
                                        subItem.action === "logout"
                                          ? async () => await logout()
                                          : undefined
                                      }
                                    >
                                      {subItem?.url ? (
                                        <Link href={subItem.url}>
                                          {subItem.icon && Icon && <Icon />}
                                          <span>{subItem.title}</span>
                                        </Link>
                                      ) : (
                                        <>
                                          {subItem.icon && Icon && <Icon />}
                                          <span>{subItem.title}</span>
                                        </>
                                      )}
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild={!!item.url}
                          tooltip={item.title}
                          isActive={pathname === item.url}
                          onClick={
                            item.action === "logout"
                              ? async () => await logout()
                              : undefined
                          }
                        >
                          {item.url ? (
                            <Link href={item.url}>
                              {Icon && <Icon />}
                              <span>{item.title}</span>
                            </Link>
                          ) : (
                            <>
                              {Icon && <Icon />}
                              <span>{item.title}</span>
                            </>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {isLoading ? (
                <div className="flex items-center gap-2 p-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="size-8 rounded-lg">
                        <AvatarImage
                          src={session?.user.image ?? ""}
                          alt={`${session?.user.name} ${session?.user.lastName}`}
                        />
                        <AvatarFallback className="rounded-lg">
                          {session?.user.name?.slice(0, 2)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {session?.user.name ?? ""}{" "}
                          {session?.user.lastName ?? ""}
                        </span>
                        <span className="truncate text-xs">
                          {session?.user.email ?? ""}
                        </span>
                      </div>
                      <IconSelector className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="size-8 rounded-lg">
                          <AvatarImage
                            src={session?.user.image ?? ""}
                            alt={`${session?.user.name} ${session?.user.lastName}`}
                          />
                          <AvatarFallback className="rounded-lg">
                            {session?.user.name?.slice(0, 2)?.toUpperCase() ??
                              "MB"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {session?.user.name ?? ""}{" "}
                            {session?.user.lastName ?? ""}
                          </span>
                          <span className="truncate text-xs">
                            {" "}
                            {session?.user.email ?? ""}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <IconRosetteDiscountCheck />
                        Account
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <IconCreditCard />
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <IconBell />
                        Notifications
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <IconLogout />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="group flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex flex-grow items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>
          <div className="hidden w-1/3 items-center gap-2 px-4 md:flex">
            <SearchInput />
          </div>
          <div className="flex items-center gap-2 px-4">
            <UserNav />
            <ThemeToggle />
          </div>
        </header>
        {/* PAGE MAIN CONTENT */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};
