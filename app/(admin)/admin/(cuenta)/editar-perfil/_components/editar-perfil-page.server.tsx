import { Suspense } from "react";

import { AdminPageHeader } from "@/components/admin-page-header.server";
import { PageContainer } from "@/components/layout/page-container.server";
import { Separator } from "@/components/ui/separator";
import { EditarPerfilForm } from "./editar-perfil-form.client";

export const EditarPerfilPage: React.FC = () => (
  <PageContainer>
    <div className="space-y-4">
      <AdminPageHeader
        title="Editar perfil"
        description="En esta página podrás editar tu perfil de usuario."
      />
      <Separator />
      <Suspense fallback={<div>Loading...</div>}>
        <EditarPerfilForm />
      </Suspense>
    </div>
  </PageContainer>
);
