import { Field, Schema, type Email, type UUID } from "@fabric/core";
import { useState } from "react";
import { useRPC } from "../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../utils/toasts/show-error-toast.ts";
import { showSuccessToast } from "../../../utils/toasts/show-success-toast.ts";
import { Form, FormButton, TextArea } from "../../forms/index";
import { Button } from "../../ui/button.tsx";
import { LoadingSpinner } from "../../ui/loading-spinner.tsx";

const enrollUsersSchema = new Schema({
  emails: Field.string(),
});

export function EnrollUsersModal({
  closeModal,
  courseId,
  onEnrollSuccess,
}: {
  closeModal: () => void;
  courseId: UUID;
  onEnrollSuccess: () => Promise<void>;
}) {
  const enrollUsers = useRPC("enrollUsersByEmail");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: { emails: string }): Promise<void> => {
    setIsSubmitting(true);

    try {
      const emailList = data.emails
        .split(",")
        .map((email) => email.trim())
        .filter((e) => e) as Email[];
      const result = await enrollUsers({
        courseId,
        emails: emailList,
      });

      if (result.isOk()) {
        showSuccessToast("Usuarios inscritos correctamente");
        closeModal();
        await onEnrollSuccess();
      } else if (result.isError()) {
        showErrorToast(`Error al inscribir usuarios: ${result.value.message}`);
      } else {
        showErrorToast("Error al inscribir usuarios");
      }
    } catch {
      showErrorToast("Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-alt p-6 rounded-lg shadow-lg w-full max-w-lg">
      <h3 className="text-xl font-bold mb-4">Inscribir Usuarios</h3>
      <Form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        schema={enrollUsersSchema}
      >
        <TextArea
          name="emails"
          label="Correos Electrónicos (separados por coma)"
          className="w-full px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition duration-200 ease-in-out"
        />
        <div className="flex justify-end gap-2">
          <Button
            onClick={closeModal}
            className="bg-gray-700 text-white"
            type="button"
          >
            Cancelar
          </Button>
          <FormButton className="bg-primary text-white" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner /> : "Inscribir"}
          </FormButton>
        </div>
      </Form>
    </div>
  );
}
