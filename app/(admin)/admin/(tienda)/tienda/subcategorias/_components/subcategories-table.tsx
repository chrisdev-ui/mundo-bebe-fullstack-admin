"use client";

import { use, useMemo, useState } from "react";

import { useFeatureFlags } from "@/components/feature-flags-provider";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableAdvancedToolbar } from "@/components/ui/table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import {
  getActiveCategories,
  getSubcategories,
  getSubcategoriesCount,
} from "../_lib/queries";
import { TableSubCategory } from "../_lib/validations";
import { DeleteSubcategoriesDialog } from "./delete-subcategories-dialog";
import { getColumns } from "./subcategories-columns";
import { SubcategoriesFloatingBar } from "./subcategories-floating-bar";
import { SubcategoriesToolbarActions } from "./subcategories-toolbar-actions";
import { SubcategorySheet } from "./subcategory-sheet";

interface SubcategoriesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getSubcategories>>,
      Awaited<ReturnType<typeof getSubcategoriesCount>>,
      Awaited<ReturnType<typeof getActiveCategories>>,
    ]
  >;
}

export function SubcategoriesTable({ promises }: SubcategoriesTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, subcategoryCounts, categories] = use(promises);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<TableSubCategory> | null>(null);

  const columns = useMemo(() => getColumns({ setRowAction }), []);

  const filterFields: DataTableFilterField<TableSubCategory>[] = [
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
          count: subcategoryCounts.active,
        },
        {
          label: "Inactivas",
          value: "false",
          count: subcategoryCounts.inactive,
        },
      ],
    },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<TableSubCategory>[] =
    [
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
        id: "categoryId",
        label: "Categoría",
        type: "select",
        options: categories.map((category) => ({
          label: category.name,
          value: category.id,
        })),
      },
      {
        id: "active",
        label: "Estado",
        type: "boolean",
        options: [
          {
            label: "Activas",
            value: "true",
            count: subcategoryCounts.active,
          },
          {
            label: "Inactivas",
            value: "false",
            count: subcategoryCounts.inactive,
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
          enableFloatingBar ? <SubcategoriesFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            tableName="subcategories"
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <SubcategoriesToolbarActions
              table={table}
              setRowAction={setRowAction}
            />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar
            table={table}
            tableName="subcategories"
            filterFields={filterFields}
          >
            <SubcategoriesToolbarActions
              table={table}
              setRowAction={setRowAction}
            />
          </DataTableToolbar>
        )}
      </DataTable>
      <SubcategorySheet
        type={rowAction?.type === "create" ? "create" : "update"}
        open={rowAction?.type === "update" || rowAction?.type === "create"}
        onOpenChange={() => setRowAction(null)}
        subcategory={
          rowAction?.row && rowAction?.type === "update"
            ? rowAction.row.original
            : null
        }
        categories={categories}
      />
      <DeleteSubcategoriesDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        subcategoriesToDelete={
          rowAction?.row?.original ? [rowAction.row.original] : []
        }
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
}
