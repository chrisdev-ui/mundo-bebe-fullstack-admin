import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <Button>Cerrar sesión</Button>
    </form>
  );
}
