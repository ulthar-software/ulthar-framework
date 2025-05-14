import { exhaustiveCheck } from "@fabric/core";
import { AccessPolicy, UserRole } from "@ulthar/academy-domain";
import { useState } from "react";
import type { ListUsersOutput } from "../../../domain/dist/use-cases/user/list-users";
import { InviteUserModal } from "../components/academy/modals/invite-single-user-modal.tsx";
import { PageContainer } from "../components/academy/page-container.tsx";
import { PageContent } from "../components/academy/page-content.tsx";
import { PageTitle } from "../components/academy/page-title.tsx";
import { PlatformFooter } from "../components/academy/platform-footer.tsx";
import { PlatformHeader } from "../components/academy/platform-header.tsx";
import { Button } from "../components/ui/button.tsx";
import { Icon } from "../components/ui/icon.tsx";
import { LoadingSpinner } from "../components/ui/loading-spinner.tsx";
import { useAuthGuard } from "../utils/auth/use-auth-guard.ts";
import { useAuthHasPerm } from "../utils/auth/use-auth-has-perm.ts";
import { useModal } from "../utils/modal/modal-hooks.tsx";
import { useQuery } from "../utils/rpc/use-query.ts";

export type ViewUserModel = ListUsersOutput["users"][number];

// Modal component for inviting users

export default function UsersPage() {
  useAuthGuard(AccessPolicy.WithPermission("LIST_USERS"));

  const { showModal } = useModal();
  const canInviteUser = useAuthHasPerm("INVITE_USERS");

  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add this above the return statement, after your other state declarations:
  const [invitesPage, setInvitesPage] = useState(1);
  const [isLoadingInvites, invitesResponse, invitesError, refetchInvites] =
    useQuery("listUserInvites", {
      page: invitesPage,
      pageSize,
      filter: filter.length > 0 ? filter : undefined,
    });
  const invites =
    invitesResponse && "invitations" in invitesResponse
      ? invitesResponse.invitations
      : [];
  const noInvitesFound =
    !isLoadingInvites && !invitesError && invites.length === 0;

  const nextInvitesPage = () => {
    if (invites.length === pageSize) setInvitesPage(invitesPage + 1);
  };
  const prevInvitesPage = () => {
    if (invitesPage > 1) setInvitesPage(invitesPage - 1);
  };

  function translateNotificationStatus(status: "QUEUED" | "SENT" | "FAILED") {
    switch (status) {
      case "QUEUED":
        return "En cola";
      case "SENT":
        return "Enviado";
      case "FAILED":
        return "Fallido";
      default:
        return status;
    }
  }

  // Explicitly type the query call
  const [isLoading, usersResponse, error, refetch] = useQuery("listUsers", {
    page: currentPage,
    pageSize,
    filter: filter.length > 0 ? filter : undefined,
  });

  // Handle search input change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Show invite user modal
  const handleShowInviteModal = () => {
    const [closeModal] = showModal(
      <InviteUserModal
        closeModal={() => {
          closeModal();
        }}
        onInviteSuccess={async () => {
          await refetch();
          await refetchInvites();
        }}
      />,
    );
  };

  // Safely handle next page action
  const nextPage = () => {
    if (
      usersResponse &&
      "users" in usersResponse &&
      usersResponse.users.length === pageSize
    ) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Safely get users from response
  const getUsers = (): ViewUserModel[] => {
    if (!usersResponse || !("users" in usersResponse)) {
      return [];
    }
    return usersResponse.users;
  };

  // Get users and check status
  const users = getUsers();
  const noUsersFound =
    !isLoading &&
    !error &&
    usersResponse &&
    "users" in usersResponse &&
    usersResponse.users.length === 0;

  return (
    <PageContainer>
      <PlatformHeader />
      <PageContent>
        <PageTitle>Usuarios</PageTitle>

        {/* Search input */}
        <div className="w-full mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={filter}
              onChange={handleFilterChange}
              placeholder="Buscar usuarios..."
              className="w-full px-4 py-2 pl-10 bg-dark-alt text-white rounded border border-gray-700 focus:border-primary focus:outline-none"
            />
            <Icon
              name="bx-search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="flex gap-2">
            {canInviteUser && (
              <Button
                onClick={handleShowInviteModal}
                className="bg-primary text-white flex gap-2 items-center"
              >
                <Icon name="bx-user-plus" />
                Invitar usuario
              </Button>
            )}
          </div>
        </div>

        {/* Users table */}
        <div className="w-full rounded-lg overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead className="bg-dark-alt">
              <tr>
                <th className="text-left p-4">Nombre completo</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Rol</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    <LoadingSpinner className="mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-red-400">
                    Error al cargar usuarios
                  </td>
                </tr>
              ) : noUsersFound ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-gray-800 hover:bg-gray-800"
                  >
                    <td className="p-4">{`${user.firstName} ${user.lastName}`}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{translateRole(user.role)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-400">
            {!isLoading && !error && `Mostrando página ${currentPage}`}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={prevPage}
              disabled={currentPage <= 1 || isLoading}
              className="bg-dark-alt text-white flex gap-1 items-center"
            >
              <Icon name="bx-chevron-left" />
              Anterior
            </Button>
            <Button
              onClick={nextPage}
              disabled={isLoading || users.length < pageSize}
              className="bg-dark-alt text-white flex gap-1 items-center"
            >
              Siguiente
              <Icon name="bx-chevron-right" />
            </Button>
          </div>
        </div>

        <h3 className="mt-8 mb-2 font-bold">Invitaciones pendientes</h3>

        {/* User Invites Table */}
        <div className="w-full rounded-lg overflow-hidden border border-gray-700 ">
          <table className="w-full">
            <thead className="bg-dark-alt">
              <tr>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Rol</th>
                <th className="text-left p-4">Estado de notificación</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {isLoadingInvites ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    <LoadingSpinner className="mx-auto" />
                  </td>
                </tr>
              ) : invitesError ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-red-400">
                    Error al cargar invitaciones
                  </td>
                </tr>
              ) : noInvitesFound ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center">
                    No se encontraron invitaciones
                  </td>
                </tr>
              ) : (
                invites.map((invite) => (
                  <tr
                    key={invite.id}
                    className="border-t border-gray-800 hover:bg-gray-800"
                  >
                    <td className="p-4">{invite.email}</td>
                    <td className="p-4">{translateRole(invite.role)}</td>
                    <td className="p-4">
                      {translateNotificationStatus(invite.notificationStatus)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination for invites */}
          <div className="flex justify-between items-center mt-2 px-4 pb-2">
            <div className="text-sm text-gray-400">
              {!isLoadingInvites &&
                !invitesError &&
                `Mostrando página ${invitesPage}`}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={prevInvitesPage}
                disabled={invitesPage <= 1 || isLoadingInvites}
                className="bg-dark-alt text-white flex gap-1 items-center"
              >
                <Icon name="bx-chevron-left" />
                Anterior
              </Button>
              <Button
                onClick={nextInvitesPage}
                disabled={isLoadingInvites || invites.length < pageSize}
                className="bg-dark-alt text-white flex gap-1 items-center"
              >
                Siguiente
                <Icon name="bx-chevron-right" />
              </Button>
            </div>
          </div>
        </div>
      </PageContent>
      <PlatformFooter />
    </PageContainer>
  );
}

// Helper function to translate roles into Spanish
function translateRole(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrador";
    case UserRole.TEACHER:
      return "Profesor";
    case UserRole.STUDENT:
      return "Estudiante";
    default:
      return exhaustiveCheck(role);
  }
}
