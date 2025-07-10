import type { UUID } from "@fabric/core";
import type { ModuleSummary } from "@ulthar/academy-domain";
import { useState } from "react";
import { useQuery } from "../../../utils/rpc/use-query.ts";
import { Icon } from "../../ui/icon.tsx";

interface StudentProgressDetailsModalProps {
  closeModal: () => void;
  studentId: UUID;
  modules: ModuleSummary[];
}

export function StudentProgressDetailsModal({
  closeModal,
  studentId,
  modules,
}: StudentProgressDetailsModalProps) {
  const [selectedModule, setSelectedModule] = useState(() => modules[0].id);
  const [isLoading, progressData] = useQuery("getDetailedStudentProgress", {
    moduleId: selectedModule,
    studentId: studentId,
  });
  return (
    <div className="bg-dark-alt p-6 rounded-lg shadow-lg w-full max-w-xl relative">
      <button
        onClick={closeModal}
        className="absolute top-2 right-2 p-2 focus:outline-none hover:cursor-pointer"
      >
        <Icon name="bx-x" />
      </button>
      <h2 className="text-xl font-semibold mb-4">
        Detalle de progreso de estudiante
      </h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Seleccionar módulo:
        </label>
        <select
          className="w-full p-2 bg-dark-alt border border-gray-600 rounded"
          value={selectedModule}
          onChange={(e) => {
            const moduleId = e.target.value;
            setSelectedModule(moduleId as UUID);
          }}
        >
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </select>
      </div>
      {isLoading && (
        <div className="text-center text-gray-400">Cargando progreso...</div>
      )}

      {progressData && (
        <div className="space-y-4">
          {progressData.quizzes.map((quiz) => {
            const isCurrentVersion = quiz.isCurrentVersion ?? false;
            const isCompleted = isCurrentVersion && quiz.score == 100;
            return (
              <div key={quiz.quizId} className="p-4 bg-dark-alt rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{quiz.quizTitle}</h3>
                  <div className="flex items-center gap-2">
                    {isCurrentVersion && (
                      <Icon
                        name="bx-badge-check"
                        className="text-blue-500 text-lg"
                        title="Versión actual"
                      />
                    )}
                    {!isCurrentVersion && quiz.score && (
                      <Icon
                        name="bx-badge-check"
                        className="text-red-500 text-lg"
                        title="Versión vieja, el cuestionario ha sido actualizado y debe ser completado de nuevo."
                      />
                    )}
                    <Icon
                      name={isCompleted ? "bx-check-circle" : "bx-time"}
                      className={`text-lg ${
                        isCompleted ? "text-green-500" : "text-yellow-500"
                      }`}
                      title={
                        isCompleted
                          ? "Cuestionario completado con éxito."
                          : "Cuestionario pendiente de completar."
                      }
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Intentos: {quiz.attempts}
                </p>
                <p className="text-sm text-gray-400">
                  Ultimo puntaje: {quiz.score ?? "N/A"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
