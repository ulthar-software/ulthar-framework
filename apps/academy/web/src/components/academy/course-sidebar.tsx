import { type UUID } from "@fabric/core";
import type { GetCourseDetailsOutput } from "@ulthar/academy-domain";
import { useEffect, useState } from "react";
import { clx } from "../../utils/styles/clx.ts";
import { Anchor } from "../ui/anchor.tsx";
import { Button } from "../ui/button.tsx";
import { Icon } from "../ui/icon.tsx";

interface CourseSidebarProps {
  courseData: GetCourseDetailsOutput;
  showSidebar: boolean;
  onCloseSidebar: () => void;
  courseId: UUID;
  currentModuleId?: UUID;
  currentUnitId?: UUID;
}

export function CourseSidebar({
  courseData,
  showSidebar,
  onCloseSidebar,
  courseId,
  currentModuleId,
  currentUnitId,
}: CourseSidebarProps) {
  // State to track which module is expanded
  const [expandedModuleId, setExpandedModuleId] = useState<UUID | undefined>(
    currentModuleId,
  );

  // Update expanded module when currentModuleId changes
  useEffect(() => {
    if (currentModuleId) {
      setExpandedModuleId(currentModuleId);
    }
  }, [currentModuleId]);

  // Toggle module expansion
  const toggleModule = (moduleId: UUID) => {
    setExpandedModuleId(expandedModuleId === moduleId ? undefined : moduleId);
  };

  return (
    <aside
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
                  {isExpanded ? (
                    <Icon name="bx-chevron-up" className="text-xl" />
                  ) : (
                    <Icon name="bx-chevron-down" className="text-xl" />
                  )}
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
