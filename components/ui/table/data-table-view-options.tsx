import { useRef } from "react";
import { IconCheck, IconSelector, IconSettings2 } from "@tabler/icons-react";
import { InferSelectModel } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { columnLabelMappings } from "@/constants";
import { cn, toSentenceCase } from "@/lib/utils";
import { DataTableViewOptionsProps, DbTables } from "@/types";

export function DataTableViewOptions<TData>({
  table,
  tableName,
}: DataTableViewOptionsProps<TData>) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          aria-label="Alternar la visibilidad columnas"
          variant="outline"
          role="combobox"
          size="sm"
          className="ml-auto hidden h-8 gap-2 focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0 lg:flex"
        >
          <IconSettings2 className="size-4" />
          Columnas
          <IconSelector className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-44 p-0"
        onCloseAutoFocus={() => triggerRef.current?.focus()}
      >
        <Command>
          <CommandInput placeholder="Buscar columnas..." />
          <CommandList>
            <CommandEmpty>No se encontraron columnas.</CommandEmpty>
            <CommandGroup>
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  const columnName = column.id as keyof InferSelectModel<
                    DbTables[typeof tableName]
                  >;
                  return (
                    <CommandItem
                      key={column.id}
                      onSelect={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                    >
                      <span className="truncate">
                        {columnLabelMappings[tableName]?.[columnName] ??
                          toSentenceCase(column.id)}
                      </span>
                      <IconCheck
                        className={cn(
                          "ml-auto size-4 shrink-0",
                          column.getIsVisible() ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
