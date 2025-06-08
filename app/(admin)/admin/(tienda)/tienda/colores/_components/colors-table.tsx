"use client";

import { use, useMemo, useState } from "react";

import { useFeatureFlags } from "@/components/feature-flags-provider";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableAdvancedToolbar } from "@/components/ui/table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import type { Color } from "@/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import { getColors, getColorsCount } from "../_lib/queries";
import { ColorSheet } from "./color-sheet";
import { getColumns } from "./colors-columns";
import { ColorsFloatingBar } from "./colors-floating-bar";
import { ColorsToolbarActions } from "./colors-toolbar-actions";
import { DeleteColorsDialog } from "./delete-color-dialog";

interface ColorsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getColors>>,
      Awaited<ReturnType<typeof getColorsCount>>,
    ]
  >;
}

export function ColorsTable({ promises }: ColorsTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, colorCounts] = use(promises);

  const [rowAction, setRowAction] = useState<DataTableRowAction<Color> | null>(
    null,
  );

  const columns = useMemo(() => getColumns({ setRowAction }), []);

  const filterFields: DataTableFilterField<Color>[] = [
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
          count: colorCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: colorCounts.inactive,
        },
      ],
    },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<Color>[] = [
    {
      id: "name",
      label: "Nombre",
      type: "text",
    },
    {
      id: "code",
      label: "Color",
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
          count: colorCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: colorCounts.inactive,
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
          enableFloatingBar ? <ColorsFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            tableName="colors"
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <ColorsToolbarActions table={table} setRowAction={setRowAction} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar
            table={table}
            tableName="colors"
            filterFields={filterFields}
          >
            <ColorsToolbarActions table={table} setRowAction={setRowAction} />
          </DataTableToolbar>
        )}
      </DataTable>
      <ColorSheet
        type={rowAction?.type === "create" ? "create" : "update"}
        open={rowAction?.type === "update" || rowAction?.type === "create"}
        onOpenChange={() => setRowAction(null)}
        color={
          rowAction?.row && rowAction?.type === "update"
            ? rowAction.row.original
            : null
        }
      />
      <DeleteColorsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        colorsToDelete={
          rowAction?.row?.original ? [rowAction.row.original] : []
        }
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
}
