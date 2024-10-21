import { auth } from "@/auth";
import { Forbidden } from "@/components/auth/forbidden.client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userHasAccess =
    session?.user?.role === "SUPER_ADMIN" || session?.user.role === "ADMIN";

  if (!userHasAccess) {
    return <Forbidden />;
  }

  return children;
}
