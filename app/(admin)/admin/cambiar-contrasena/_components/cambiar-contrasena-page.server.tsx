import { AdminPageHeader } from "@/components/admin-page-header.server";
import { PageContainer } from "@/components/layout/page-container.server";
import { Separator } from "@/components/ui/separator";

export const CambiarContrasenaPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="space-y-4">
        <AdminPageHeader
          title="Cambiar contraseña"
          description="En esta página podrás actualizar la contraseña de tu cuenta."
        />
        <Separator />
        <div></div>
      </div>
    </PageContainer>
  );
};
