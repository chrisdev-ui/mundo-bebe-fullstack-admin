"use client";

import { use, useMemo, useState } from "react";

import { useFeatureFlags } from "@/components/feature-flags-provider";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableAdvancedToolbar } from "@/components/ui/table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/ui/table/data-table-toolbar";
import { ProductType } from "@/db/schema";
import { useDataTable } from "@/hooks/use-data-table";
import {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import { getProductTypes, getProductTypesCount } from "../_lib/queries";
import { DeleteProductTypesDialog } from "./delete-product-types-dialog";
import { ProductTypeSheet } from "./product-type-sheet";
import { getColumns } from "./product-types-columns";
import { ProductTypesFloatingBar } from "./product-types-floating-bar";
import { ProductTypesToolbarActions } from "./product-types-toolbar-actions";

interface ProductTypesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getProductTypes>>,
      Awaited<ReturnType<typeof getProductTypesCount>>,
    ]
  >;
}

export function ProductTypesTable({ promises }: ProductTypesTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, productTypeCounts] = use(promises);

  const [rowAction, setRowAction] =
    useState<DataTableRowAction<ProductType> | null>(null);

  const columns = useMemo(() => getColumns({ setRowAction }), []);

  const filterFields: DataTableFilterField<ProductType>[] = [
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
          label: "Activos",
          value: "true",
          count: productTypeCounts.active,
        },
        {
          label: "Inactivos",
          value: "false",
          count: productTypeCounts.inactive,
        },
      ],
    },
  ];

  const advancedFilterFields: DataTableAdvancedFilterField<ProductType>[] = [
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
          label: "Activos",
          value: "true",
          count: productTypeCounts.active,
        },
        {
          label: "Inactivos",
          value: "false",
          count: productTypeCounts.inactive,
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
          enableFloatingBar ? <ProductTypesFloatingBar table={table} /> : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            tableName="productTypes"
            filterFields={advancedFilterFields}
            shallow={false}
          >
            <ProductTypesToolbarActions
              table={table}
              setRowAction={setRowAction}
            />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar
            table={table}
            tableName="productTypes"
            filterFields={filterFields}
          >
            <ProductTypesToolbarActions
              table={table}
              setRowAction={setRowAction}
            />
          </DataTableToolbar>
        )}
      </DataTable>
      <ProductTypeSheet
        type={rowAction?.type === "create" ? "create" : "update"}
        open={rowAction?.type === "update" || rowAction?.type === "create"}
        onOpenChange={() => setRowAction(null)}
        productType={
          rowAction?.row && rowAction?.type === "update"
            ? rowAction.row.original
            : null
        }
      />
      <DeleteProductTypesDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        productTypesToDelete={
          rowAction?.row?.original ? [rowAction.row.original] : []
        }
        showTrigger={false}
        onSuccess={() => rowAction?.row?.toggleSelected(false)}
      />
    </>
  );
}
