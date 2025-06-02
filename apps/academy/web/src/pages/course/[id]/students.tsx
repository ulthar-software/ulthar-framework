import type { UUID } from "@fabric/core";
import { exhaustiveCheck, Field, Schema } from "@fabric/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { EnrollUsersModal } from "../../../components/academy/modals/enroll-users-modal.tsx";
import { PageContainer } from "../../../components/academy/page-container.tsx";
import { PageContent } from "../../../components/academy/page-content.tsx";
import { PlatformFooter } from "../../../components/academy/platform-footer.tsx";
import { PlatformHeader } from "../../../components/academy/platform-header.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Icon } from "../../../components/ui/icon.tsx";
import { LoadingSpinner } from "../../../components/ui/loading-spinner.tsx";
import { useModal } from "../../../utils/modal/modal-hooks.tsx";
import { useParsedRouteParams } from "../../../utils/routing/use-route-params.ts";
import { useQuery } from "../../../utils/rpc/use-query.ts";
import { useRPC } from "../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../utils/toasts/show-error-toast.ts";
import { showSuccessToast } from "../../../utils/toasts/show-success-toast.ts";

const routeSchema = new Schema({
  id: Field.uuid(),
});

export default function CourseStudentsPage() {
  const { id } = useParsedRouteParams(routeSchema, "/");

  const navigate = useNavigate();

  const [filter, setFilter] = useState("");

  const { showModal } = useModal();

  const [isLoadingCourse, courseData, courseError] = useQuery(
    "getCourseDetails",
    {
      courseId: id,
    },
  );

  const [isLoadingStudents, studentsData, , refreshStudents] = useQuery(
    "getCourseEnrollments",
    {
      courseId: id,
      filter: filter.length > 0 ? filter : undefined,
    },
  );

  const resendInvite = useRPC("resendInvite");

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseError]);

  if (isLoadingCourse) {
    return (
      <PageContainer>
        <PlatformHeader title={`Estudiantes`} />
        <PageContent>
          <div className="flex-grow flex justify-center items-center">
            <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
          </div>
        </PageContent>
        <PlatformFooter />
      </PageContainer>
    );
  }
  async function handleResendInvite(id: UUID): Promise<void> {
    const result = await resendInvite({ inviteId: id });
    if (result.isError()) {
      const error = result.value;
      switch (error._tag) {
        case "UnexpectedError": {
          showErrorToast(
            "Ocurrió un error inesperado al reenviar la invitación.",
          );
          break;
        }
        case "NotFoundError": {
          showErrorToast("No se encontró la invitación.");
          break;
        }
        default: {
          exhaustiveCheck(error);
        }
      }
    }

    showSuccessToast("Invitación reenviada correctamente.");

    await refreshStudents();
  }

  if (courseData) {
    return (
      <PageContainer>
        <PlatformHeader title={`Estudiantes - ${courseData.course.title}`} />
        <PageContent>
          <Button
            title="volver"
            onClick={() => navigate(-1)}
            className="mb-4 text-primary"
          >
            <Icon name="bx-arrow-back" className="mr-2" />
            Volver
          </Button>
          <div className="w-full mb-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={filter}
                onChange={handleFilterChange}
                placeholder="Buscar usuarios..."
                className="w-full px-4 py-2 pl-12 bg-dark-alt text-white rounded-lg shadow-md border border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition duration-200 ease-in-out"
              />
              <Icon
                name="bx-search"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
          {isLoadingStudents ? (
            <div className="flex-grow flex justify-center items-center">
              <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
            </div>
          ) : (
            <>
              {/* Users Table */}
              <div className="flex justify-between items-center">
                <h3 className="mt-8 mb-2 font-bold">Usuarios</h3>
                <Button
                  onClick={() => {
                    const [close] = showModal(
                      <EnrollUsersModal
                        closeModal={() => {
                          close();
                        }}
                        courseId={id}
                        onEnrollSuccess={refreshStudents}
                      />,
                    );
                  }}
                  className="bg-primary text-white"
                >
                  Invitar estudiantes
                </Button>
              </div>
              <div className="w-full rounded-lg overflow-hidden border border-gray-700">
                <table className="w-full">
                  <thead className="bg-dark-alt">
                    <tr>
                      <th className="text-left p-4">Nombre completo</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Progreso</th>
                      <th className="text-left p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900">
                    {studentsData && studentsData.students.length > 0 ? (
                      studentsData.students
                        .sort((a, b) => b.quizzes - a.quizzes)
                        .map((student) => (
                          <tr
                            key={student.id}
                            className="border-t border-gray-800 hover:bg-gray-800"
                          >
                            <td className="p-2">{`${student.firstName} ${student.lastName}`}</td>
                            <td className="p-2">{student.email}</td>
                            <td className="p-2">
                              {(
                                (student.quizzes / studentsData.totalQuizzes) *
                                100
                              ).toFixed(2)}
                              %
                            </td>
                            <td className="p-2 text-warning">
                              <Icon name="bx-error" /> En construcción
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* User Invites Table */}
              <h3 className="mt-8 mb-2 font-bold">Invitaciones pendientes</h3>
              <div className="w-full rounded-lg overflow-hidden border border-gray-700">
                <table className="w-full">
                  <thead className="bg-dark-alt">
                    <tr>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Estado</th>
                      <th className="text-left p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900">
                    {studentsData &&
                    Array.isArray(studentsData.invites) &&
                    studentsData.invites.length > 0 ? (
                      studentsData.invites.map((invite) => (
                        <tr
                          key={invite.id}
                          className="border-t border-gray-800 hover:bg-gray-800"
                        >
                          <td className="p-2">{invite.email}</td>
                          <td className="p-2 text-warning">Pendiente</td>
                          <td className="p-2">
                            <Button
                              onClick={() => handleResendInvite(invite.id)}
                              className="bg-primary text-white"
                              title="Reenviar invitación"
                            >
                              <Icon name="bx-refresh" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center">
                          No se encontraron invitaciones
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </PageContent>
        <PlatformFooter />
      </PageContainer>
    );
  }
}
