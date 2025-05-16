import type { TaggedContentSection } from "@ulthar/academy-domain";
import type { PropsWithChildren } from "react";
import { useAuthHasPerm } from "../../../utils/auth/use-auth-has-perm.ts";
import { useModal } from "../../../utils/modal/modal-hooks.tsx";
import { Button } from "../../ui/button.tsx";
import { Icon } from "../../ui/icon.tsx";
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
  return (
    <div className="relative max-w-6xl w-full mx-auto">
      {hasEditPermission && (
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
      )}
      {children}
    </div>
  );
}
