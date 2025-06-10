"use client";

import { IconDownload, IconPlus } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Design } from "@/db/schema";
import { exportTableToCSV } from "@/lib/export-table";
import { DataTableRowAction } from "@/types";
import { DeleteDesignsDialog } from "./delete-design-dialog";

interface DesignsToolbarActionsProps {
  table: Table<Design>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Design> | null>
  >;
}

export function DesignsToolbarActions({
  table,
  setRowAction,
}: DesignsToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setRowAction({ type: "create" })}
      >
        <IconPlus className="size-4" aria-hidden="true" />
        Nuevo diseño
      </Button>
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteDesignsDialog
          designsToDelete={table
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
            filename: "diseños",
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
