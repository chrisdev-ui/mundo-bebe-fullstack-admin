"use client";

import { use, useMemo, useState } from "react";

import { useFeatureFlags } from "@/components/feature-flags-provider";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableAdvancedToolbar } from "@/components/ui/table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { Category } from "@/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import { getCategories, getCategoriesCount } from "../_lib/queries";
import { getColumns } from "./categories-columns";
import { CategoriesFloatingBar } from "./categories-floating-bar";
import { CategoriesToolbarActions } from "./categories-toolbar-actions";
import { CategorySheet } from "./category-sheet";
import { DeleteCategoriesDialog } from "./delete-categories-dialog";

interface CategoriesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getCategories>>,
      Awaited<ReturnType<typeof getCategoriesCount>>,
    ]
  >;
}

export function CategoriesTable({ promises }: CategoriesTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, categoryCounts] = use(promises);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<Category> | null>(null);

  const columns = useMemo(() => getColumns({ setRowAction }), []);

  const filterFields: DataTableFilterField<Category>[] = [
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
          count: categoryCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: categoryCounts.inactive,
        },
      ],
    },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<Category>[] = [
    {
      id: "name",
      label: "Nombre",
      type: "text",
    },
    {
      id: "slug",
      label: "Identificador",
      type: "text",
    },
    {
      id: "description",
      label: "Descripción",
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
          count: categoryCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: categoryCounts.inactive,
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
          enableFloatingBar ? <CategoriesFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            tableName="categories"
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <CategoriesToolbarActions
              table={table}
              setRowAction={setRowAction}
            />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar
            table={table}
            tableName="categories"
            filterFields={filterFields}
          >
            <CategoriesToolbarActions
              table={table}
              setRowAction={setRowAction}
            />
          </DataTableToolbar>
        )}
      </DataTable>
      <CategorySheet
        type={rowAction?.type === "create" ? "create" : "update"}
        open={rowAction?.type === "update" || rowAction?.type === "create"}
        onOpenChange={() => setRowAction(null)}
        category={
          rowAction?.row && rowAction?.type === "update"
            ? rowAction.row.original
            : null
        }
      />
      <DeleteCategoriesDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        categoriesToDelete={
          rowAction?.row?.original ? [rowAction.row.original] : []
        }
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
}
