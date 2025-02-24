"use client";

import { use, useMemo, useState } from "react";

import { useFeatureFlags } from "@/components/feature-flags-provider";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableAdvancedToolbar } from "@/components/ui/table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { roleIcons, roleMappings } from "@/constants";
import { User, users } from "@/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import { getUserRolesCounts, getUsers } from "../_lib/queries";
import { DeleteUsersDialog } from "./delete-users-dialog";
import { getColumns } from "./manage-users-columns";
import { ManageUsersFloatingBar } from "./manage-users-floating-bar";
import { ManageUsersToolbarActions } from "./manage-users-toolbar-actions";
import { UserSheet } from "./user-sheet";

interface ManageUsersTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getUsers>>,
      Awaited<ReturnType<typeof getUserRolesCounts>>,
    ]
  >;
}

export const ManageUsersTable: React.FC<ManageUsersTableProps> = ({
  promises,
}) => {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, userRolesCounts] = use(promises);

  const [rowAction, setRowAction] = useState<DataTableRowAction<User> | null>(
    null,
  );

  const columns = useMemo(() => getColumns({ setRowAction }), []);

  const filterFields: DataTableFilterField<User>[] = [
    {
      id: "name",
      label: "Nombre completo",
      placeholder: "Buscar por nombre...",
    },
    {
      id: "role",
      label: "Rol",
      options: users.role.enumValues.map((role) => ({
        label: roleMappings[role],
        value: role,
        icon: roleIcons[role],
        count: userRolesCounts[role],
      })),
    },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<User>[] = [
    {
      id: "name",
      label: "Nombre completo",
      type: "text",
    },
    {
      id: "email",
      label: "Correo electrónico",
      type: "text",
    },
    {
      id: "phoneNumber",
      label: "Teléfono",
      type: "text",
    },
    {
      id: "role",
      label: "Rol",
      type: "multi-select",
      options: users.role.enumValues.map((role) => ({
        label: roleMappings[role],
        value: role,
        count: userRolesCounts[role],
      })),
    },
    {
      id: "createdAt",
      label: "Fecha de creación",
      type: "date",
    },
    {
      id: "dob",
      label: "Fecha de nacimiento",
      type: "date",
    },
  ];

  const enableAdvancedTable = featureFlags.includes("advancedTable");
  const enableFloatingBar = featureFlags.includes("floatingBar");

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable
        table={table}
        floatingBar={
          enableFloatingBar ? <ManageUsersFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <ManageUsersToolbarActions
              table={table}
              setRowAction={setRowAction}
            />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table} filterFields={filterFields}>
            <ManageUsersToolbarActions
              table={table}
              setRowAction={setRowAction}
            />
          </DataTableToolbar>
        )}
      </DataTable>
      <UserSheet
        type={rowAction?.type === "create" ? "create" : "update"}
        open={rowAction?.type === "update" || rowAction?.type === "create"}
        onOpenChange={() => setRowAction(null)}
        user={
          rowAction?.row && rowAction?.type === "update"
            ? rowAction.row.original
            : null
        }
      />
      <DeleteUsersDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        usersToDelete={rowAction?.row?.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
};
