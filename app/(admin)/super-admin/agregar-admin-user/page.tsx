import { auth } from "@/auth";
import { Forbidden } from "@/components/auth/forbidden.client";
import { AuthContainer } from "@/components/layout/auth-container.server";
import { InviteAdminCard } from "@/components/layout/invite-admin-card.server";

export default async function InviteAdminPage() {
  const session = await auth();
  const userHasAccess = session?.user?.role === "SUPER_ADMIN";

  if (!userHasAccess) {
    return <Forbidden />;
  }

  return (
    <AuthContainer>
      <InviteAdminCard />
    </AuthContainer>
  );
}
