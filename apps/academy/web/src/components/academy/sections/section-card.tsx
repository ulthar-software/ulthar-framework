import { exhaustiveCheck } from "@fabric/core";
import type { TaggedContentSection } from "@ulthar/academy-domain";
import type { PropsWithChildren } from "react";
import { useAuthHasPerm } from "../../../utils/auth/use-auth-has-perm.ts";
import { useModal } from "../../../utils/modal/modal-hooks.tsx";
import { useRPC } from "../../../utils/rpc/use-rpc.ts";
import { Button } from "../../ui/button.tsx";
import { Icon } from "../../ui/icon.tsx";
import { DeleteSectionModal } from "../modals/course-crud/delete-section-modal.tsx";
import { EditSectionModal } from "../modals/course-crud/edit-section-modal.tsx";

export interface SectionCardProps {
  section: TaggedContentSection;
  refreshUnit: () => Promise<void>;
}

export function SectionCard({
  children,
  section,
  refreshUnit,
}: PropsWithChildren<SectionCardProps>) {
  const hasEditPermission = useAuthHasPerm("EDIT_COURSE");
  const { showModal } = useModal();

  // RPC commands for each section type
  const deleteTextSection = useRPC("deleteTextSection");
  const deleteVideoSection = useRPC("deleteVideoSection");
  const deleteQuestionnaireSection = useRPC("deleteQuestionnaireSection");

  function getDeleteHandler() {
    switch (section.type) {
      case "TEXT":
        return async () => {
          const result = await deleteTextSection({ sectionId: section.id });
          if (result.isError()) {
            // TODO: show error toast
            return;
          }
          await refreshUnit();
        };
      case "VIDEO":
        return async () => {
          const result = await deleteVideoSection({ sectionId: section.id });
          if (result.isError()) {
            // TODO: show error toast
            return;
          }
          await refreshUnit();
        };
      case "QUESTIONNAIRE":
        return async () => {
          const result = await deleteQuestionnaireSection({
            sectionId: section.id,
          });
          if (result.isError()) {
            // TODO: show error toast
            return;
          }
          await refreshUnit();
        };
      default:
        return exhaustiveCheck(section);
    }
  }

  const handleDelete = getDeleteHandler();
  return (
    <div className="relative max-w-6xl w-full mx-auto">
      {hasEditPermission && (
        <>
          <Button
            onClick={() => {
              const [close] = showModal(
                <EditSectionModal
                  section={section}
                  closeModal={() => {
                    close();
                  }}
                  refreshUnit={refreshUnit}
                />,
              );
            }}
            title="Editar Sección"
            className="text-primary px-3 py-2 flex items-center absolute top-2 right-2 rounded-md hover:bg-primary-dark"
          >
            <Icon name="bx-edit" />
          </Button>
          <Button
            onClick={() => {
              const [closeModal] = showModal(
                <DeleteSectionModal
                  onDelete={handleDelete}
                  closeModal={() => {
                    closeModal();
                  }}
                />,
              );
            }}
            title="Eliminar Sección"
            className="text-red-400 px-3 py-2 flex items-center absolute top-2 right-16 rounded-md hover:bg-red-700"
          >
            <Icon name="bx-trash" />
          </Button>
        </>
      )}
      {children}
    </div>
  );
}
