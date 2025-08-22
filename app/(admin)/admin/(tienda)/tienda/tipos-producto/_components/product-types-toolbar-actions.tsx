"use client";

import { IconDownload, IconPlus } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ProductType } from "@/db/schema";
import { exportTableToCSV } from "@/lib/export-table";
import { DataTableRowAction } from "@/types";
import { DeleteProductTypesDialog } from "./delete-product-types-dialog";

interface ProductTypesToolbarActionsProps {
  table: Table<ProductType>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<ProductType> | null>
  >;
}

export function ProductTypesToolbarActions({
  table,
  setRowAction,
}: ProductTypesToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setRowAction({ type: "create" })}
      >
        <IconPlus className="size-4" aria-hidden="true" />
        Nuevo tipo
      </Button>
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteProductTypesDialog
          productTypesToDelete={table
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
            filename: "tipos-producto",
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