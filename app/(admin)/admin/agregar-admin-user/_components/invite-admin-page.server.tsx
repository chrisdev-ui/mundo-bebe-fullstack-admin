import { AdminPageHeader } from "@/components/admin-page-header.server";
import { PageContainer } from "@/components/layout/page-container.server";
import { Separator } from "@/components/ui/separator";
import { InviteAdminForm } from "./invite-admin-form.client";

export const InviteAdminPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="space-y-4">
        <AdminPageHeader
          title="Agregar administrador"
          description="En esta página podrás agregar usuarios como administradores y revisar todas las invitaciones que se han enviado."
        />
        <Separator />
        <InviteAdminForm />
      </div>
    </PageContainer>
  );
};
