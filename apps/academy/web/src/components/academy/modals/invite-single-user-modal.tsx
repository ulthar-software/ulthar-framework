import type { Email } from "@fabric/core";
import { UserRole } from "@ulthar/academy-domain";
import { useState } from "react";
import { useRPC } from "../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../utils/toasts/show-error-toast.ts";
import { showSuccessToast } from "../../../utils/toasts/show-success-toast.ts";
import { Button } from "../../ui/button.tsx";
import { LoadingSpinner } from "../../ui/loading-spinner.tsx";

export function InviteUserModal({
  closeModal,
  onInviteSuccess,
}: {
  closeModal: () => void;
  onInviteSuccess: () => Promise<void>;
}) {
  const inviteUser = useRPC("inviteUser");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await inviteUser({
        email: email as Email,
        role,
      });

      if (result.isOk()) {
        showSuccessToast(`Invitación enviada a ${email}`);
        closeModal();
        await onInviteSuccess();
      } else if (result.isError()) {
        showErrorToast(
          `Error al enviar la invitación: ${result.value.message}`,
        );
      } else {
        showErrorToast("Error al enviar la invitación");
      }
    } catch {
      showErrorToast("Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-alt p-6 rounded-lg shadow-lg w-full max-w-md">
      <h3 className="text-xl font-bold mb-4">Invitar Usuario</h3>
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
      >
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
            className="w-full px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="role" className="block mb-2 text-sm">
            Rol
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as UserRole);
            }}
            className="w-full px-3 py-2 bg-gray-900 text-white rounded border border-gray-700"
          >
            <option value={UserRole.STUDENT}>Estudiante</option>
            <option value={UserRole.TEACHER}>Profesor</option>
            <option value={UserRole.ADMIN}>Administrador</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={closeModal}
            className="bg-gray-700 text-white"
            type="button"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={() => {
              return;
            }} // Keep empty to allow form submission
            className="bg-primary text-white"
          >
            {isSubmitting ? <LoadingSpinner /> : "Invitar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
