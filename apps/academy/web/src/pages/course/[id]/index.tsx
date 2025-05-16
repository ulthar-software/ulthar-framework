import { exhaustiveCheck, type UUID } from "@fabric/core";
import type {
  GetCourseDetailsOutput,
  ModuleSummary,
} from "@ulthar/academy-domain";
import { AccessPolicy } from "@ulthar/academy-domain";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ContentSectionBlock } from "../../../components/academy/content-section.tsx";
import { CourseSidebar } from "../../../components/academy/course-sidebar.tsx";
import { AddSectionModal } from "../../../components/academy/modals/course-crud/add-section-modal.tsx";
import { AddTagsToUnitModal } from "../../../components/academy/modals/course-crud/add-tags-to-unit-modal.tsx";
import { EditUnitTitleModal } from "../../../components/academy/modals/course-crud/edit-unit-title-modal.tsx";
import { PageContainer } from "../../../components/academy/page-container.tsx";
import { PageTitle } from "../../../components/academy/page-title.tsx";
import { PlatformFooter } from "../../../components/academy/platform-footer.tsx";
import { PlatformHeader } from "../../../components/academy/platform-header.tsx";
import { ResourceSidebar } from "../../../components/academy/resource-sidebar.tsx";
import { Anchor } from "../../../components/ui/anchor.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Icon } from "../../../components/ui/icon.tsx";
import { LoadingSpinner } from "../../../components/ui/loading-spinner.tsx";
import { useAuthGuard } from "../../../utils/auth/use-auth-guard.ts";
import { useAuthHasPerm } from "../../../utils/auth/use-auth-has-perm.ts";
import { useModal } from "../../../utils/modal/modal-hooks.tsx";
import { useQuery } from "../../../utils/rpc/use-query.ts";
import { showErrorToast } from "../../../utils/toasts/show-error-toast.ts";

export default function CourseView() {
  useAuthGuard(AccessPolicy.Authenticated());

  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { showModal } = useModal();

  const canEditCourse = useAuthHasPerm("EDIT_COURSE");
  const canEnrollStudents = useAuthHasPerm("ENROLL_STUDENTS");

  // State for controlling the visibility of the module sidebar
  const [showModulesSidebar, setShowModulesSidebar] = useState(false);

  const [courseHasNoUnits, setCourseHasNoUnits] = useState(false);

  // Fetch course data
  const [isLoadingCourse, courseData, courseError, refreshCourse] = useQuery(
    "getCourseDetails",
    {
      courseId: id as UUID,
    },
  );

  const paramsUnitId = getParamsUnitId(searchParams, id as UUID);

  // Fetch unit data
  const [isLoadingUnit, unitData, unitError, refreshUnit] = useQuery(
    "getUnitWithSections",
    {
      courseId: id as UUID,
      unitId: paramsUnitId,
    },
  );

  const currentModule = useMemo(
    () => getModuleSummary(courseData, unitData?.unit.moduleId),
    [courseData, unitData],
  );

  // Use the extracted function in a useMemo hook
  const nextAndPrevUnitIds = useMemo(
    () => getPrevAndNextUnitIds(courseData, unitData?.unit.id),
    [courseData, unitData?.unit.id],
  );

  useEffect(() => {
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
        case "EmptyCourseError": {
          setCourseHasNoUnits(true);
          break;
        }
        default: {
          exhaustiveCheck(unitError);
        }
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseError, unitError]);

  useEffect(() => {
    if (courseData && unitData) {
      localStorage.setItem(
        getLastUnitKey(courseData.course.id),
        unitData.unit.id,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseData?.course.id, unitData?.unit.id]);

  // When we have the course data
  return (
    <PageContainer>
      <PlatformHeader title={courseData?.course.title} />
      {isLoadingCourse && (
        <div className="flex-grow flex justify-center items-center">
          <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
        </div>
      )}

      {courseData && (
        <section className="flex flex-grow h-[calc(100vh-8rem)]">
          {/* Course sidebar component */}
          <CourseSidebar
            courseData={courseData}
            showSidebar={showModulesSidebar}
            refreshCourse={refreshCourse}
            onCloseSidebar={() => {
              setShowModulesSidebar(false);
            }}
            currentModuleId={unitData?.unit.moduleId}
            currentUnitId={paramsUnitId}
            courseId={id as UUID}
          />

          {/* Main content - now with overflow scroll */}
          <section className="flex-grow p-6 md:p-8 overflow-y-auto">
            {/* Toggle button for sidebar on mobile */}
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={() => {
                  setShowModulesSidebar(!showModulesSidebar);
                }}
                className="mb-4 bg-dark-alt text-primary px-3"
              >
                <Icon name="bx-menu" className="mr-2" />
                Ver módulos
              </Button>

              {canEnrollStudents && (
                <Anchor
                  href={`/course/${id}/students`}
                  className="flex items-center transition-colors rounded bg-primary p-2"
                  title=" Ver estudiantes inscriptos"
                >
                  <Icon
                    name="bxs-user-account"
                    className="text-white text-xl"
                  />
                </Anchor>
              )}
            </div>

            {isLoadingUnit && (
              <div className="flex-grow flex justify-center items-center">
                <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
              </div>
            )}

            {courseHasNoUnits && (
              <div className="bg-dark-alt p-8 rounded-lg text-center">
                <p className="text-gray-400 mb-4">
                  No hay unidades disponibles en este curso.
                </p>
              </div>
            )}

            {unitData && (
              <>
                {/* Module > Unit title */}
                {currentModule && (
                  <div className="text-gray-400 mb-2 text-sm">
                    {currentModule.title}
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <PageTitle>
                    {unitData.unit.title}
                    {canEditCourse && (
                      <Button
                        onClick={() => {
                          const [close] = showModal(
                            <EditUnitTitleModal
                              unitId={unitData.unit.id}
                              currentTitle={unitData.unit.title}
                              closeModal={() => {
                                close();
                              }}
                              refreshUnit={refreshUnit}
                            />,
                          );
                        }}
                        className="text-primary px-3 py-2 flex items-center"
                        title="Editar Título de Unidad"
                      >
                        <Icon name="bx-edit" />
                      </Button>
                    )}
                  </PageTitle>

                  {canEditCourse && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          const [close] = showModal(
                            <AddSectionModal
                              unitId={unitData.unit.id}
                              courseId={id as UUID}
                              closeModal={() => {
                                close();
                              }}
                              refreshUnit={refreshUnit}
                            />,
                          );
                        }}
                        className="text-primary border px-3 py-2 flex items-center"
                        title="Agregar Sección"
                      >
                        <Icon name="bx-plus" />
                      </Button>
                      <Button
                        onClick={() => {
                          const [close] = showModal(
                            <AddTagsToUnitModal
                              unitId={unitData.unit.id}
                              unitTags={unitData.tags}
                              closeModal={() => {
                                close();
                              }}
                              refresh={refreshUnit}
                            />,
                          );
                        }}
                        className="text-primary border px-3 py-2 flex items-center"
                        title="Editar Etiquetas"
                      >
                        <Icon name="bx-tag" />
                      </Button>
                    </div>
                  )}
                </div>

                <section className="space-y-6">
                  {unitData.sections.map((section) => (
                    <ContentSectionBlock
                      key={section.id}
                      section={section}
                      refreshUnit={refreshUnit}
                    />
                  ))}
                </section>

                <NavigationControls
                  id={id as UUID}
                  prevUnitId={nextAndPrevUnitIds.prevUnitId}
                  nextUnitId={nextAndPrevUnitIds.nextUnitId}
                />
              </>
            )}
          </section>

          {/* Right sidebar for concepts - always visible and fixed height */}
          {id && unitData && (
            <ResourceSidebar courseId={id as UUID} unitId={unitData.unit.id} />
          )}
        </section>
      )}

      <PlatformFooter />
    </PageContainer>
  );
}

function NavigationControls({
  prevUnitId,
  nextUnitId,
  id,
}: PrevAndNextUnitIds & { id: UUID }) {
  return (
    <>
      <div className="mt-8 flex justify-between border-t border-gray-700 pt-4">
        {/* Previous unit button */}
        {prevUnitId ? (
          <Anchor
            href={`/course/${id}?unitId=${prevUnitId}`}
            className="flex items-center text-primary hover:text-primary-light transition-colors"
          >
            <Icon name="bx-chevron-left" className="text-xl mr-1" />
            Unidad anterior
          </Anchor>
        ) : (
          <div></div> // Empty div to maintain layout
        )}

        {/* Next unit button */}
        {nextUnitId ? (
          <Anchor
            href={`/course/${id}?unitId=${nextUnitId}`}
            className="flex items-center text-primary hover:text-primary-light transition-colors"
          >
            Siguiente unidad
            <Icon name="bx-chevron-right" className="text-xl ml-1" />
          </Anchor>
        ) : (
          <div></div> // Empty div to maintain layout
        )}
      </div>
    </>
  );
}

function getModuleSummary(
  courseData: GetCourseDetailsOutput | undefined,
  moduleId: UUID | undefined,
): ModuleSummary | undefined {
  if (!courseData || !moduleId) {
    return undefined;
  }

  // Find the current module
  const currentModule = courseData.modules.find(
    (module) => module.id === moduleId,
  );

  return currentModule ?? undefined;
}

interface PrevAndNextUnitIds {
  prevUnitId: UUID | undefined;
  nextUnitId: UUID | undefined;
}

function getAllUnitIds(courseData: GetCourseDetailsOutput | undefined) {
  if (!courseData) {
    return [];
  }

  return courseData.modules.flatMap((module) =>
    module.units.map((unit) => unit.id),
  );
}

function getPrevAndNextUnitIds(
  courseData: GetCourseDetailsOutput | undefined,
  unitId: UUID | undefined,
): PrevAndNextUnitIds {
  if (!courseData || !unitId) {
    return {
      prevUnitId: undefined,
      nextUnitId: undefined,
    };
  }

  // Find the current module's units to determine previous and next units
  let prevUnitId: UUID | undefined = undefined;
  let nextUnitId: UUID | undefined = undefined;

  const allUnitIds = getAllUnitIds(courseData);
  const currentUnitIndex = allUnitIds.indexOf(unitId);

  if (currentUnitIndex > 0) {
    prevUnitId = allUnitIds[currentUnitIndex - 1];
  }
  if (currentUnitIndex < allUnitIds.length - 1) {
    nextUnitId = allUnitIds[currentUnitIndex + 1];
  }

  return {
    prevUnitId,
    nextUnitId,
  };
}

function getParamsUnitId(
  searchParams: URLSearchParams,
  courseId: UUID,
): UUID | undefined {
  const paramsUnitId = searchParams.get("unitId");

  if (!paramsUnitId) {
    const lastUnitId = localStorage.getItem(getLastUnitKey(courseId));
    if (!lastUnitId) {
      return undefined;
    }
    return lastUnitId as UUID;
  }

  return paramsUnitId ? (paramsUnitId as UUID) : undefined;
}

function getLastUnitKey(courseId: UUID): string {
  return `${courseId}-last_unit_id`;
}
