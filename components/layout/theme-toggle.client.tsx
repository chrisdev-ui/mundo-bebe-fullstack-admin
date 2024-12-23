"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ThemeToggle: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <IconSun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <IconMoon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {}}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>Oscuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => {}}>Sistema</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
