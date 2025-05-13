import type { ContentSection } from "@ulthar/academy-domain";
import type { PropsWithChildren } from "react";
import { useAuthHasPerm } from "../../../utils/auth/use-auth-has-perm.ts";
import { Button } from "../../ui/button.tsx";
import { Icon } from "../../ui/icon.tsx";

export interface SectionCardProps {
  section: ContentSection;
}

export function SectionCard({ children }: PropsWithChildren<SectionCardProps>) {
  const hasEditPermission = useAuthHasPerm("EDIT_COURSE");
  return (
    // <div className="bg-dark-alt p-6 rounded-lg shadow-md">
    <div className="p-6 relative">
      {hasEditPermission && (
        <Button
          onClick={() => {
            // const [close] = showModal(
            //   <EditSectionModal
            //     unitId={unitId as UUID}
            //     courseId={id as UUID}
            //     closeModal={close}
            //     refreshUnit={refreshUnit}
            //   />,
            // );
          }}
          className="bg-primary text-white px-3 py-2 flex items-center absolute top-2 right-2 rounded-md hover:bg-primary-dark"
        >
          <Icon name="bx-edit" className="mr-1" />
          Editar Sección
        </Button>
      )}
      {/* <h3 className="text-2xl font-bold text-white mb-3">{section.title}</h3> */}
      {children}
    </div>
  );
}
