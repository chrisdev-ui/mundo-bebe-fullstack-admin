import { PageContainer } from "@/components/layout/page-container.server";

export default async function DashboardPage() {
  return (
    <PageContainer scrollable>
      <div className="flex size-full items-center justify-center">
        Panel de control
      </div>
    </PageContainer>
  );
}
