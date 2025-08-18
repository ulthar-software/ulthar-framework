import { type Course, Permission } from "@ulthar/academy-domain";
import { useNavigate } from "react-router";
import { useAuthHasPerm } from "../../utils/auth/use-auth-has-perm.ts";
import { useModal } from "../../utils/modal/modal-hooks.tsx";
import { Anchor } from "../ui/anchor.tsx";
import { Button } from "../ui/button.tsx";
import { Icon } from "../ui/icon.tsx";
import { CloneCourseModal } from "./modals/course-crud/clone-course-modal.tsx";

export interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate();
  const { showModal } = useModal();
  const canCreateCourse = useAuthHasPerm(Permission.CREATE_COURSE);

  const handleCloneCourse = () => {
    const [closeModal] = showModal(
      <CloneCourseModal
        sourceId={course.id}
        sourceTitle={course.title}
        navigate={navigate}
        closeModal={() => {
          closeModal();
        }}
      />,
    );
  };

  return (
    <div className="flex flex-col bg-dark-alt shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-700 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <Icon name="bx-image" className="text-9xl" />
        </div>
        {canCreateCourse && (
          <div className="absolute top-2 right-2">
            <Button
              onClick={handleCloneCourse}
              className="bg-dark-alt/80 text-primary p-2 rounded-md hover:bg-dark-alt transition-colors duration-300"
              title="Clonar curso"
            >
              <Icon name="bx-copy" className="text-lg" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-primary mb-2">
          {course.title}
        </h3>
        <p className="text-gray-300 text-sm flex-grow line-clamp-3">
          {course.description}
        </p>
        <div className="mt-4 flex justify-end">
          <Anchor
            href={`/course/${course.id}`}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300"
          >
            Ver curso
          </Anchor>
        </div>
      </div>
    </div>
  );
}
