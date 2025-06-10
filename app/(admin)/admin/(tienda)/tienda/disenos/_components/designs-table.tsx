"use client";

import { use, useMemo, useState } from "react";

import { useFeatureFlags } from "@/components/feature-flags-provider";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableAdvancedToolbar } from "@/components/ui/table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { Design } from "@/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import { getDesigns, getDesignsCount } from "../_lib/queries";
import { DeleteDesignsDialog } from "./delete-design-dialog";
import { DesignSheet } from "./design-sheet";
import { getColumns } from "./designs-columns";
import { DesignsFloatingBar } from "./designs-floating-bar";
import { DesignsToolbarActions } from "./designs-toolbar-actions";

interface DesignsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getDesigns>>,
      Awaited<ReturnType<typeof getDesignsCount>>,
    ]
  >;
}

export function DesignsTable({ promises }: DesignsTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, designCounts] = use(promises);

  const [rowAction, setRowAction] = useState<DataTableRowAction<Design> | null>(
    null,
  );

  const columns = useMemo(() => getColumns({ setRowAction }), []);

  const filterFields: DataTableFilterField<Design>[] = [
    {
      id: "name",
      label: "Nombre",
      placeholder: "Buscar por nombre...",
    },
    {
      id: "active",
      label: "Estado",
      options: [
        {
          label: "Activas",
          value: "true",
          count: designCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: designCounts.inactive,
        },
      ],
    },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<Design>[] = [
    {
      id: "name",
      label: "Nombre",
      type: "text",
    },
    {
      id: "description",
      label: "Descripción",
      type: "text",
    },
    {
      id: "code",
      label: "Código",
      type: "text",
    },
    {
      id: "active",
      label: "Estado",
      type: "boolean",
      options: [
        {
          label: "Activas",
          value: "true",
          count: designCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: designCounts.inactive,
        },
      ],
    },
    {
      id: "createdAt",
      label: "Fecha de creación",
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
          enableFloatingBar ? <DesignsFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            tableName="designs"
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <DesignsToolbarActions table={table} setRowAction={setRowAction} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar
            table={table}
            tableName="designs"
            filterFields={filterFields}
          >
            <DesignsToolbarActions table={table} setRowAction={setRowAction} />
          </DataTableToolbar>
        )}
      </DataTable>
      <DesignSheet
        type={rowAction?.type === "create" ? "create" : "update"}
        open={rowAction?.type === "update" || rowAction?.type === "create"}
        onOpenChange={() => setRowAction(null)}
        design={
          rowAction?.row && rowAction?.type === "update"
            ? rowAction.row.original
            : null
        }
      />
      <DeleteDesignsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        designsToDelete={
          rowAction?.row?.original ? [rowAction.row.original] : []
        }
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
}
