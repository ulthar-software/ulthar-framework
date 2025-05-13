import { type UUID } from "@fabric/core";
import {
  Permission,
  type GetCourseDetailsOutput,
} from "@ulthar/academy-domain";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthHasPerm } from "../../utils/auth/use-auth-has-perm";
import { useModal } from "../../utils/modal/modal-hooks";
import { clx } from "../../utils/styles/clx.ts";
import { Anchor } from "../ui/anchor.tsx";
import { Button } from "../ui/button.tsx";
import { Icon } from "../ui/icon.tsx";
import { AddModuleModal } from "./add-module-modal";
import { AddUnitModal } from "./add-unit-modal";
import { EditCourseTitleModal } from "./edit-course-title-modal";

interface CourseSidebarProps {
  courseData: GetCourseDetailsOutput;
  showSidebar: boolean;
  onCloseSidebar: () => void;
  courseId: UUID;
  currentModuleId?: UUID;
  currentUnitId?: UUID;
  refreshCourse: () => Promise<void>;
}

export function CourseSidebar({
  courseData,
  showSidebar,
  onCloseSidebar,
  courseId,
  currentModuleId,
  currentUnitId,
  refreshCourse,
}: CourseSidebarProps) {
  // State to track which module is expanded
  const [expandedModuleId, setExpandedModuleId] = useState<UUID | undefined>(
    currentModuleId,
  );

  // Ref to track sidebar element
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Update expanded module when currentModuleId changes
  useEffect(() => {
    if (currentModuleId) {
      setExpandedModuleId(currentModuleId);
    }
  }, [currentModuleId]);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!showSidebar) return; // Only add listener when sidebar is open

    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onCloseSidebar();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSidebar, onCloseSidebar]);

  // Toggle module expansion
  const toggleModule = (moduleId: UUID) => {
    setExpandedModuleId(expandedModuleId === moduleId ? undefined : moduleId);
  };

  const isEditable = useAuthHasPerm(Permission.EDIT_COURSE);
  const { showModal } = useModal();
  const navigate = useNavigate();

  const handleEditCourseTitle = () => {
    const [closeModal] = showModal(
      <EditCourseTitleModal
        refreshCourse={refreshCourse}
        courseId={courseId}
        currentTitle={courseData.course.title}
        closeModal={() => {
          closeModal();
        }}
      />,
    );
  };

  const handleAddModule = () => {
    const [closeModal] = showModal(
      <AddModuleModal
        refreshCourse={refreshCourse}
        courseId={courseId}
        closeModal={() => {
          closeModal();
        }}
      />,
    );
  };

  return (
    <aside
      ref={sidebarRef}
      className={clx(
        `bg-dark-alt fixed inset-y-0 left-0 z-30 w-96 transform transition-transform duration-300 ease-in-out`,
        showSidebar ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary">
            {courseData.course.title}
          </h2>
          {isEditable && (
            <div className="flex items-center">
              <Button
                onClick={handleEditCourseTitle}
                className="text-gray-400 hover:text-primary"
                title="Editar título del curso"
              >
                <Icon name="bx-edit" className="text-xl" />
              </Button>
              <Button
                onClick={handleAddModule}
                className="text-gray-400 hover:text-primary"
                title="Agregar módulo"
              >
                <Icon name="bx-plus" className="text-xl" />
              </Button>
            </div>
          )}
          <Button
            onClick={onCloseSidebar}
            className="text-gray-400 hover:text-primary"
          >
            <Icon name="bx-x" className="text-xl" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto h-full pb-20">
        {courseData.modules.map((module) => {
          const isExpanded = expandedModuleId === module.id;
          const isCurrentModule = currentModuleId === module.id;

          return (
            <div key={module.id} className="mb-4">
              <div
                className={clx(
                  "px-4 py-2 font-medium text-white",
                  isCurrentModule ? "bg-primary/20" : "bg-gray-800",
                  "cursor-pointer hover:bg-gray-700/50 transition-colors duration-200",
                )}
                onClick={() => {
                  toggleModule(module.id);
                }}
              >
                <div className="flex justify-between items-center">
                  <span>{module.title}</span>
                  <div className="flex items-center gap-2">
                    {isEditable && (
                      <Button
                        onClick={() => {
                          const [closeModal] = showModal(
                            <AddUnitModal
                              navigate={navigate}
                              courseId={courseId}
                              moduleId={module.id}
                              refreshCourse={refreshCourse}
                              closeModal={() => {
                                closeModal();
                              }}
                            />,
                          );
                        }}
                        className="text-gray-400 hover:text-primary"
                        title="Agregar unidad"
                      >
                        <Icon name="bx-plus" className="text-xl" />
                      </Button>
                    )}
                    {isExpanded ? (
                      <Icon name="bx-chevron-up" className="text-xl" />
                    ) : (
                      <Icon name="bx-chevron-down" className="text-xl" />
                    )}
                  </div>
                </div>
              </div>

              {/* Show units if module is expanded or if it's the current module */}
              {isExpanded && (
                <nav>
                  <ul className="py-1">
                    {module.units.map((unit) => (
                      <li key={unit.id}>
                        <Anchor
                          onClick={onCloseSidebar}
                          href={`/course/${courseId}?unitId=${unit.id}`}
                          className={clx(
                            "block px-6 py-2 text-sm hover:bg-gray-700",
                            currentUnitId === unit.id
                              ? "bg-gray-700 text-primary"
                              : "text-gray-300",
                          )}
                        >
                          {unit.title}
                        </Anchor>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
