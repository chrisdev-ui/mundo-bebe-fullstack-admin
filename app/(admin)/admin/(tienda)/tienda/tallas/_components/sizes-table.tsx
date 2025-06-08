"use client";

import { use, useMemo, useState } from "react";

import { useFeatureFlags } from "@/components/feature-flags-provider";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableAdvancedToolbar } from "@/components/ui/table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { Size } from "@/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import { getSizes, getSizesCount } from "../_lib/queries";
import { DeleteSizesDialog } from "./delete-size-dialog";
import { SizeSheet } from "./size-sheet";
import { getColumns } from "./sizes-columns";
import { SizesFloatingBar } from "./sizes-floating-bar";
import { SizesToolbarActions } from "./sizes-toolbar-actions";

interface SizesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getSizes>>,
      Awaited<ReturnType<typeof getSizesCount>>,
    ]
  >;
}

export function SizesTable({ promises }: SizesTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, sizeCounts] = use(promises);

  const [rowAction, setRowAction] = useState<DataTableRowAction<Size> | null>(
    null,
  );

  const columns = useMemo(() => getColumns({ setRowAction }), []);

  const filterFields: DataTableFilterField<Size>[] = [
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
          count: sizeCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: sizeCounts.inactive,
        },
      ],
    },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<Size>[] = [
    {
      id: "name",
      label: "Nombre",
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
          count: sizeCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: sizeCounts.inactive,
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
          enableFloatingBar ? <SizesFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            tableName="sizes"
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <SizesToolbarActions table={table} setRowAction={setRowAction} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar
            table={table}
            tableName="sizes"
            filterFields={filterFields}
          >
            <SizesToolbarActions table={table} setRowAction={setRowAction} />
          </DataTableToolbar>
        )}
      </DataTable>
      <SizeSheet
        type={rowAction?.type === "create" ? "create" : "update"}
        open={rowAction?.type === "update" || rowAction?.type === "create"}
        onOpenChange={() => setRowAction(null)}
        size={
          rowAction?.row && rowAction?.type === "update"
            ? rowAction.row.original
            : null
        }
      />
      <DeleteSizesDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        sizesToDelete={rowAction?.row?.original ? [rowAction.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
}
