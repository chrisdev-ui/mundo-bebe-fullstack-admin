import { DataTableFilterList } from "@/components/ui/table/data-table-filter-list";
import { DataTableSortList } from "@/components/ui/table/data-table-sort-list";
import { DataTableViewOptions } from "@/components/ui/table/data-table-view-options";
import { cn } from "@/lib/utils";
import { DataTableAdvancedToolbarProps } from "@/types";

export function DataTableAdvancedToolbar<TData>({
  table,
  filterFields = [],
  debounceMs = 300,
  shallow = true,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto p-1",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <DataTableFilterList
          table={table}
          filterFields={filterFields}
          debounceMs={debounceMs}
          shallow={shallow}
        />
        <DataTableSortList
          table={table}
          debounceMs={debounceMs}
          shallow={shallow}
        />
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
