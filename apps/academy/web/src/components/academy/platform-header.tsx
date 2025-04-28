import { useAuthLogout } from "../../utils/auth/use-auth-logout.ts";
import { Button } from "../ui/button.tsx";
import { UltharLogo } from "./ulthar-logo.tsx";

export function PlatformHeader() {
  const logout = useAuthLogout();
  return (
    <header className="flex p-4 gap-4 w-full shadow bg-dark-alt h-16 justify-between">
      <UltharLogo size="small" showText={false} />

      <Button
        onClick={() => {
          logout();
        }}
      >
        Cerrar sesión
      </Button>
    </header>
  );
}
