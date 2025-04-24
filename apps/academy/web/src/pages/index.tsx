import { AccessPolicy } from "@ulthar/academy-domain";
import { CourseCard } from "../components/academy/course-card.tsx";
import { UltharLogo } from "../components/academy/ulthar-logo.tsx";
import { LoadingSpinner } from "../components/ui/loading-spinner.tsx";
import { useAuthGuard } from "../utils/auth/use-auth-guard.ts";
import { useQuery } from "../utils/rpc/use-query.ts";

export default function Home() {
  useAuthGuard(AccessPolicy.LoggedIn());

  const [isLoading, coursesData, error] = useQuery("getAllCourses", {});

  const hasNoCourses =
    !isLoading && !error && coursesData && coursesData.courses.length === 0;

  const hasCourses =
    !isLoading && !error && coursesData && coursesData.courses.length > 0;

  return (
    <main className="flex flex-col min-h-screen">
      <header className="flex p-4 gap-4 w-full shadow bg-dark-alt">
        <UltharLogo size="small" showText={false} />
      </header>
      <section className="grow w-full max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-primary mb-6">
          Cursos disponibles
        </h2>

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
      </section>
      <footer className="flex justify-center p-4 gap-4 w-full shadow bg-dark-alt text-sm">
        <p className="text-center">
          Ulthar Academy - 2025 - Todos los derechos reservados
        </p>
      </footer>
    </main>
  );
}
