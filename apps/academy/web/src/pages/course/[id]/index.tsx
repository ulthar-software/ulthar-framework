import { exhaustiveCheck, type UUID } from "@fabric/core";
import { AccessPolicy } from "@ulthar/academy-domain";
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { PageContainer } from "../../../components/academy/page-container.tsx";
import { PageTitle } from "../../../components/academy/page-title.tsx";
import { PlatformFooter } from "../../../components/academy/platform-footer.tsx";
import { PlatformHeader } from "../../../components/academy/platform-header.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Icon } from "../../../components/ui/icon.tsx";
import { LoadingSpinner } from "../../../components/ui/loading-spinner.tsx";
import { useAuthGuard } from "../../../utils/auth/use-auth-guard.ts";
import { useQuery } from "../../../utils/rpc/use-query.ts";
import { clx } from "../../../utils/styles/clx.ts";
import { showErrorToast } from "../../../utils/toasts/show-error-toast.ts";

export default function CourseView() {
  useAuthGuard(AccessPolicy.LoggedIn());
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const unitId = searchParams.get("unitId");

  // State for controlling the visibility of the module sidebar
  const [showModulesSidebar, setShowModulesSidebar] = useState(false);

  // Fetch course data
  const [isLoadingCourse, courseData, courseError] = useQuery(
    "getCourseDetails",
    {
      courseId: id as UUID,
    },
  );

  // Fetch unit data
  const [isLoadingUnit, unitData, unitError] = useQuery("getUnitWithSections", {
    courseId: id as UUID,
    unitId: unitId as UUID,
  });

  if (courseError) {
    switch (courseError._tag) {
      case "CourseNotFoundError": {
        showErrorToast("Este curso ya no está disponible.");
        void navigate("/");
        break;
      }
      case "NotEnrolledInCourseError": {
        showErrorToast("No estás inscripto en este curso.");
        void navigate("/");
        break;
      }
      case "UnexpectedError": {
        showErrorToast(
          "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
        );
        void navigate("/");
        break;
      }
      default: {
        exhaustiveCheck(courseError);
      }
    }
    return;
  }

  if (unitError) {
    switch (unitError._tag) {
      case "UnitNotFoundError": {
        showErrorToast("Esta unidad no está disponible.");
        void navigate("/");
        break;
      }
      case "UnexpectedError": {
        showErrorToast(
          "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
        );
        void navigate("/");
        break;
      }
      case "CourseNotFoundError": {
        showErrorToast("Este curso ya no está disponible.");
        void navigate("/");
        break;
      }
      case "NotEnrolledInCourseError": {
        showErrorToast("No estás inscripto en este curso.");
        void navigate("/");
        break;
      }
      default: {
        exhaustiveCheck(unitError);
      }
    }
    return;
  }

  // When we have the course data
  return (
    <PageContainer>
      <PlatformHeader />
      {isLoadingCourse && (
        <div className="flex-grow flex justify-center items-center">
          <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
        </div>
      )}

      {courseData && (
        <div className="flex flex-grow">
          {/* Left sidebar for modules - hidden by default */}
          <aside
            className={clx(
              `bg-dark-alt fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out`,
              showModulesSidebar ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-primary">
                  {courseData.course.title}
                </h2>
                <Button
                  onClick={() => {
                    setShowModulesSidebar(false);
                  }}
                  className="text-gray-400 hover:text-primary"
                >
                  <Icon name="bx-x" className="text-xl" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {courseData.modules.map((module) => (
                <div key={module.id} className="mb-4">
                  <div className="px-4 py-2 font-medium text-white bg-gray-800">
                    {module.title}
                  </div>
                  <ul className="py-1">
                    {/* This would be populated with units when we implement unit fetching */}
                    {module.units.map((unit) => {
                      return (
                        <li
                          key={unit.id}
                          className="px-6 py-2 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer"
                        >
                          {unit.title}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <section className="flex-grow p-6 md:p-8">
            {/* Toggle button for sidebar on mobile */}
            <Button
              onClick={() => {
                setShowModulesSidebar(!showModulesSidebar);
              }}
              className="mb-4 bg-dark-alt text-primary px-3"
            >
              <Icon name="bx-menu" className="mr-2" />
              Ver módulos
            </Button>

            {isLoadingUnit && (
              <div className="flex-grow flex justify-center items-center">
                <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
              </div>
            )}

            {unitData && (
              <>
                <PageTitle>{unitData.unit.title}</PageTitle>

                {/* <section className="mt-6 mb-8 text-gray-300">
                  <p> for when units have descriptions </p>
                </section> */}

                <section className="space-y-6">
                  {unitData.sections.map((section) => (
                    <div
                      className="bg-dark-alt p-6 rounded-lg shadow-md"
                      key={section.id}
                    >
                      <h3 className="text-lg font-medium text-white mb-3">
                        {section.title}
                      </h3>
                      <div className="text-gray-300">
                        <p>SECTION CONTENT</p>
                      </div>
                    </div>
                  ))}
                </section>
              </>
            )}
          </section>

          {/* Right sidebar for concepts - always visible */}
          <aside className="hidden lg:block w-96 bg-dark-alt p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Conceptos
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-800 rounded-md">
                <h3 className="font-medium text-white">Concepto 1</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Breve descripción del concepto relacionado con esta unidad.
                </p>
              </div>
              <div className="p-3 bg-gray-800 rounded-md">
                <h3 className="font-medium text-white">Concepto 2</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Breve descripción del concepto relacionado con esta unidad.
                </p>
              </div>
              <div className="p-3 bg-gray-800 rounded-md">
                <h3 className="font-medium text-white">Concepto 3</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Breve descripción del concepto relacionado con esta unidad.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <PlatformFooter />
    </PageContainer>
  );
}
