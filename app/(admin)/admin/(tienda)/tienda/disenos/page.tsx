import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin-page-header.server";
import { FeatureFlagsProvider } from "@/components/feature-flags-provider";
import { PageContainer } from "@/components/layout/page-container.server";
import { DateRangePicker } from "@/components/ui/date-range-picker.server";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { AdminPaths } from "@/constants";
import { checkModuleAccess } from "@/lib/auth";
import { getValidFilters } from "@/lib/data-table";
import { AccessModules, SearchParams } from "@/types";
import { DesignsTable } from "./_components/designs-table";
import { getDesigns, getDesignsCount } from "./_lib/queries";
import { searchParamsCache } from "./_lib/validations";

interface ManageDesignsProps {
  searchParams: Promise<SearchParams>;
}

const AccessModule: AccessModules = "admin";

export default async function ManageDesigns(props: ManageDesignsProps) {
  await checkModuleAccess(AccessModule, AdminPaths.ADMIN_PANEL);

  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getDesigns({
      ...search,
      filters: validFilters,
    }),
    getDesignsCount(),
  ]);

  return (
    <PageContainer>
      <div className="space-y-4">
        <AdminPageHeader
          title="Gestionar diseños"
          description="Aquí podrás gestionar todos los diseños de tu tienda."
        />
        <Separator />
        <FeatureFlagsProvider>
          <Suspense fallback={<Skeleton className="h-7 w-52" />}>
            <DateRangePicker
              triggerSize="sm"
              triggerClassName="ml-auto w-56 sm:w-60"
              align="end"
              shallow={false}
            />
          </Suspense>
          <Suspense
            fallback={
              <DataTableSkeleton
                columnCount={6}
                searchableColumnCount={1}
                filterableColumnCount={1}
                cellWidths={[
                  "10rem",
                  "15rem",
                  "15rem",
                  "20rem",
                  "8rem",
                  "8rem",
                ]}
                shrinkZero
              />
            }
          >
            <DesignsTable promises={promises} />
          </Suspense>
        </FeatureFlagsProvider>
      </div>
    </PageContainer>
  );
}
