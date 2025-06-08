"use client";

import { IconDownload, IconPlus } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { exportTableToCSV } from "@/lib/export-table";
import { DataTableRowAction } from "@/types";
import { TableSubCategory } from "../_lib/validations";
import { DeleteSubcategoriesDialog } from "./delete-subcategories-dialog";

interface SubcategoriesToolbarActionsProps {
  table: Table<TableSubCategory>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<TableSubCategory> | null>
  >;
}

export function SubcategoriesToolbarActions({
  table,
  setRowAction,
}: SubcategoriesToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setRowAction({ type: "create" })}
      >
        <IconPlus className="size-4" aria-hidden="true" />
        Nueva subcategoría
      </Button>
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteSubcategoriesDialog
          subcategoriesToDelete={table
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
            filename: "subcategorias",
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
