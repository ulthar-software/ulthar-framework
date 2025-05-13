import { AccessPolicy, Permission } from "@ulthar/academy-domain";
import { useNavigate } from "react-router";
import { CourseCard } from "../components/academy/course-card.tsx";
import { CreateCourseModal } from "../components/academy/modals/course-crud/create-course-modal.tsx";
import { PageContainer } from "../components/academy/page-container.tsx";
import { PageContent } from "../components/academy/page-content.tsx";
import { PageTitle } from "../components/academy/page-title.tsx";
import { PlatformFooter } from "../components/academy/platform-footer.tsx";
import { PlatformHeader } from "../components/academy/platform-header.tsx";
import { Button } from "../components/ui/button";
import { LoadingSpinner } from "../components/ui/loading-spinner.tsx";
import { useAuthGuard } from "../utils/auth/use-auth-guard.ts";
import { useAuthHasPerm } from "../utils/auth/use-auth-has-perm.ts";
import { useModal } from "../utils/modal/modal-hooks";
import { useQuery } from "../utils/rpc/use-query.ts";

export default function Home() {
  useAuthGuard(AccessPolicy.Authenticated());

  const isAdmin = useAuthHasPerm(Permission.CREATE_COURSE);
  const { showModal } = useModal();

  const [isLoading, coursesData, error] = useQuery("getAllCourses", {});

  const hasNoCourses =
    !isLoading && !error && coursesData && coursesData.courses.length === 0;

  const hasCourses =
    !isLoading && !error && coursesData && coursesData.courses.length > 0;

  const navigate = useNavigate();

  const handleCreateCourse = () => {
    const [closeModal] = showModal(
      <CreateCourseModal
        closeModal={() => {
          closeModal();
        }}
        navigate={navigate}
      />,
    );
  };

  return (
    <PageContainer>
      <PlatformHeader />

      <PageContent>
        <PageTitle>Cursos disponibles</PageTitle>

        {isAdmin && (
          <div className="absolute top-4 right-4">
            <Button
              onClick={handleCreateCourse}
              className="bg-primary text-white"
            >
              Crea un nuevo curso
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
          </div>
        )}

        {error && (
          <div className="bg-red-900/10 border border-danger/10 text-red-200 p-8 rounded-lg text-center">
            <p>
              No pudimos cargar los cursos. Por favor, inténtalo de nuevo más
              tarde.
            </p>
          </div>
        )}

        {hasNoCourses && (
          <div className="bg-dark-alt p-8 rounded-lg text-center">
            <p className="text-gray-400 mb-4">
              No estas inscripto en ningún curso.
            </p>
            <p className="text-primary">
              Contactá a un administrador para que te inscriba en uno.
            </p>
          </div>
        )}

        {hasCourses && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </PageContent>
      <PlatformFooter />
    </PageContainer>
  );
}
