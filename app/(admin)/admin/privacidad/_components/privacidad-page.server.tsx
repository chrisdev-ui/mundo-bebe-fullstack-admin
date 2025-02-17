import { AdminPageHeader } from "@/components/admin-page-header.server";
import { PageContainer } from "@/components/layout/page-container.server";
import { Separator } from "@/components/ui/separator";
import { PrivacidadForm } from "./privacidad-form.client";

export const PrivacidadPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="space-y-4">
        <AdminPageHeader
          title="Privacidad"
          description="Gestiona la privacidad de tu cuenta y datos personales."
        />
        <Separator />
        <PrivacidadForm />
      </div>
    </PageContainer>
  );
};
