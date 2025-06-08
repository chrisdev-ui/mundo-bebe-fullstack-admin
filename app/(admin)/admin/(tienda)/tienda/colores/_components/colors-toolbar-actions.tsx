"use client";

import { IconDownload, IconPlus } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { Color } from "@/db/schema";
import { exportTableToCSV } from "@/lib/export-table";
import { DataTableRowAction } from "@/types";
import { DeleteColorsDialog } from "./delete-color-dialog";

interface ColorsToolbarActionsProps {
  table: Table<Color>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Color> | null>
  >;
}

export function ColorsToolbarActions({
  table,
  setRowAction,
}: ColorsToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setRowAction({ type: "create" })}
      >
        <IconPlus className="size-4" aria-hidden="true" />
        Nuevo color
      </Button>
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteColorsDialog
          colorsToDelete={table
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
            filename: "colores",
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
