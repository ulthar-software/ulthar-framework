import type { UUID } from "@fabric/core";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, Input } from "../../../forms/index";
import { Button } from "../../../ui/button.tsx";
import { courseSchema } from "./schemas.ts";

export interface EditCourseTitleModalProps {
  courseId: UUID;
  currentTitle: string;
  closeModal: () => void;
  refreshCourse: () => Promise<void>;
}

export function EditCourseTitleModal({
  courseId,
  currentTitle,
  closeModal,
  refreshCourse,
}: EditCourseTitleModalProps) {
  const editCourseTitleCommand = useRPC("changeCourseTitle");

  const handleEditCourseTitle = async (data: {
    title: string;
  }): Promise<void> => {
    const result = await editCourseTitleCommand({
      courseId,
      title: data.title,
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al actualizar el título del curso. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    void refreshCourse();
    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Edit Course Title</h2>
      <Form
        schema={courseSchema}
        onSubmit={handleEditCourseTitle}
        className="flex flex-col gap-4"
        initialValue={{ title: currentTitle }}
      >
        <Input name="title" type="text" label="Course Title" />
        <div className="flex justify-end gap-2">
          <Button onClick={closeModal} className="bg-gray-500 text-white">
            Cancel
          </Button>
          <FormButton className="bg-primary text-white">Save</FormButton>
        </div>
      </Form>
    </div>
  );
}
