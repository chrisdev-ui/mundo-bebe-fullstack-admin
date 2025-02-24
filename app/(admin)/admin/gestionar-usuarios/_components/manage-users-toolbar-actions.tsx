"use client";

import { IconDownload, IconPlus } from "@tabler/icons-react";
import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { User } from "@/db/schema";
import { exportTableToCSV } from "@/lib/export-table";
import { DataTableRowAction } from "@/types";
import { DeleteUsersDialog } from "./delete-users-dialog";

interface ManageUsersToolbarActionsProps {
  table: Table<User>;
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<User> | null>
  >;
}

export function ManageUsersToolbarActions({
  table,
  setRowAction,
}: ManageUsersToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setRowAction({ type: "create" })}
      >
        <IconPlus className="size-4" aria-hidden="true" />
        Nuevo usuario
      </Button>
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteUsersDialog
          usersToDelete={table
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
            filename: "usuarios",
            excludeColumns: ["select", "actions"],
          })
        }
        className="gap-2"
      >
        <IconDownload className="size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  );
}
