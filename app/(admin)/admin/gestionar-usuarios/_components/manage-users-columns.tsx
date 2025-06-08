"use client";

import { IconDots } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableCellBoolean } from "@/components/ui/table/cells/data-table-cell-boolean";
import { DataTableCellDate } from "@/components/ui/table/cells/data-table-cell-date";
import { DataTableCellImage } from "@/components/ui/table/cells/data-table-cell-image";
import { DataTableCellPhone } from "@/components/ui/table/cells/data-table-cell-phone";
import { DataTableColumnHeader } from "@/components/ui/table/data-table-column-header";
import { PLACEHOLDER_IMAGE, roleIcons, roleMappings } from "@/constants";
import { User } from "@/db/schema";
import { DataTableRowAction } from "@/types";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<User> | null>
  >;
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todas las filas"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Foto de perfil" />
      ),
      cell: ({ row }) => (
        <DataTableCellImage
          src={row.original.image ?? PLACEHOLDER_IMAGE}
          alt={row.original.id}
          ratio={1 / 1}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      accessorFn: (row) => `${row.name} ${row.lastName}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre completo" />
      ),
      enableColumnFilter: true,
    },
    {
      accessorKey: "documentId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Documento de identidad" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Correo electrónico" />
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Teléfono" />
      ),
      cell: ({ row }) => (
        <DataTableCellPhone phoneNumber={row.original.phoneNumber} />
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rol" />
      ),
      cell: ({ row }) => {
        const roleLabel = roleMappings[row.original.role];
        const Icon = roleIcons[row.original.role];

        return (
          <Badge className="gap-1">
            <Icon className="-ms-0.5 size-4 opacity-60" aria-hidden="true" />
            {roleLabel}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => <DataTableCellBoolean value={row.original.active} />,
      filterFn: (row, id, value) => {
        return value === "true" ? row.getValue(id) : !row.getValue(id);
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha de creación" />
      ),
      cell: ({ row }) => <DataTableCellDate date={row.original.createdAt} />,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Abrir menú de acciones"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <IconDots className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() =>
                  setRowAction({
                    row,
                    type: "update",
                  })
                }
              >
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                Eliminar
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
