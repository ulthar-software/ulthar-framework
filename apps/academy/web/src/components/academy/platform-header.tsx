import { useEffect, useRef, useState } from "react";
import { useAuthLogout } from "../../utils/auth/use-auth-logout.ts";
import { useQuery } from "../../utils/rpc/use-query.ts";
import { clx } from "../../utils/styles/clx.ts";
import { Anchor } from "../ui/anchor.tsx";
import { Button } from "../ui/button.tsx";
import { Icon } from "../ui/icon.tsx";
import { UltharLogo } from "./ulthar-logo.tsx";

export function PlatformHeader() {
  const logout = useAuthLogout();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current user data to get first and last name
  const [isLoading, currentUserData] = useQuery("getCurrentUser", {});

  // Get user initials for the avatar
  const userInitials = currentUserData?.user
    ? `${currentUserData.user.firstName[0]}${currentUserData.user.lastName[0]}`.toUpperCase()
    : "U";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="flex p-4 gap-4 w-full shadow bg-dark-alt h-16 justify-between">
      <UltharLogo size="small" showText={false} />

      <div className="relative" ref={dropdownRef}>
        <Button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 bg-dark hover:bg-gray-800"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-semibold">
            {isLoading ? "..." : userInitials}
          </div>
          <span className="hidden sm:inline">
            {currentUserData?.user.firstName} {currentUserData?.user.lastName}
          </span>
          <Icon
            name="bx-chevron-down"
            className={clx(isOpen && "rotate-180", "transition-transform")}
          />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-dark-alt rounded-md shadow-lg z-10">
            <Anchor
              href="/"
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-white hover:bg-gray-800"
            >
              <Icon name="bx-book" /> Cursos
            </Anchor>
            <Anchor
              href="/users"
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-white hover:bg-gray-800"
            >
              <Icon name="bxs-user-account" /> Usuarios
            </Anchor>
            <Anchor
              href="/profile"
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-white hover:bg-gray-800"
            >
              <Icon name="bx-user" /> Perfil
            </Anchor>
            <Anchor
              href="/settings"
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-white hover:bg-gray-800"
            >
              <Icon name="bx-cog" /> Configuración
            </Anchor>
            <button
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-white hover:bg-gray-800 cursor-pointer"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <Icon name="bx-log-out" /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
