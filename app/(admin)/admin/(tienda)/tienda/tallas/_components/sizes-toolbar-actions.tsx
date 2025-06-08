"use client";

import { IconDownload, IconPlus } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Size } from "@/db/schema";
import { exportTableToCSV } from "@/lib/export-table";
import { DataTableRowAction } from "@/types";
import { DeleteSizesDialog } from "./delete-size-dialog";

interface SizesToolbarActionsProps {
  table: Table<Size>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Size> | null>
  >;
}

export function SizesToolbarActions({
  table,
  setRowAction,
}: SizesToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setRowAction({ type: "create" })}
      >
        <IconPlus className="size-4" aria-hidden="true" />
        Nueva talla
      </Button>
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteSizesDialog
          sizesToDelete={table
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
            filename: "tallas",
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
