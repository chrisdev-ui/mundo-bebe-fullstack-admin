import { redirect } from "next/navigation";

import { checkModuleAccess } from "@/lib/auth";

export default async function AdminPage() {
  await checkModuleAccess("admin", "/");

  return redirect("/admin/panel");
}
