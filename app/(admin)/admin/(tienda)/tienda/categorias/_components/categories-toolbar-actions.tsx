"use client";

import { IconDownload, IconPlus } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { Category } from "@/db/schema";
import { exportTableToCSV } from "@/lib/export-table";
import { DataTableRowAction } from "@/types";
import { DeleteCategoriesDialog } from "./delete-categories-dialog";

interface CategoriesToolbarActionsProps {
  table: Table<Category>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Category> | null>
  >;
}

export function CategoriesToolbarActions({
  table,
  setRowAction,
}: CategoriesToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setRowAction({ type: "create" })}
      >
        <IconPlus className="size-4" aria-hidden="true" />
        Nueva categoría
      </Button>
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteCategoriesDialog
          categoriesToDelete={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "categorias",
            excludeColumns: ["select", "actions"],
          })
        }
        className="gap-2"
      >
        <IconDownload className="size-4" aria-hidden="true" />
        Exportar
      </Button>
    </div>
  );
}
