import type { UUID } from "@fabric/core";
import type { ResourceType } from "@ulthar/academy-domain";
import { useState } from "react";
import { useAuthHasPerm } from "../../utils/auth/use-auth-has-perm.ts";
import { useModal } from "../../utils/modal/modal-hooks.tsx";
import { useQuery } from "../../utils/rpc/use-query.ts";
import { clx } from "../../utils/styles/clx.ts";
import { Anchor } from "../ui/anchor.tsx";
import { Button } from "../ui/button.tsx";
import { Icon } from "../ui/icon.tsx";
import { LoadingSpinner } from "../ui/loading-spinner.tsx";
import { MarkdownContent } from "../ui/markdown-content.tsx";
import { AddResourceModal } from "./modals/course-crud/add-resource-modal.tsx";
import { BulkAddResourceModal } from "./modals/course-crud/bulk-add-resource-modal.tsx";
import { EditResourceModal } from "./modals/course-crud/edit-resource-modal.tsx";

export interface ResourceSidebarProps {
  courseId: UUID;
  unitId: UUID;
}

type ResourceTypeDisplay = Record<
  ResourceType,
  {
    label: string;
    className: string;
  }
>;

const resourceTypeDisplayMap: ResourceTypeDisplay = {
  CONCEPT: {
    label: "Conceptos",
    className: "bg-green-900 text-white",
  },
  REQUIRED_READING: {
    label: "Lecturas obligatorias",
    className: "bg-red-900 text-white",
  },
  RECOMMENDED_READING: {
    label: "Lecturas recomendadas",
    className: "bg-blue-900 text-white",
  },
  VIDEO: {
    label: "Videos",
    className: "bg-purple-900 text-white",
  },
  DOCUMENTATION: {
    label: "Documentación",
    className: "bg-amber-900 text-white",
  },
  BLOG: {
    label: "Blogs",
    className: "bg-gray-900 text-white",
  },
  TUTORIAL: {
    label: "Tutoriales",
    className: "bg-teal-900 text-white",
  },
  TOOL: {
    label: "Herramientas",
    className: "bg-indigo-900 text-white",
  },
};

export function ResourceSidebar({ courseId, unitId }: ResourceSidebarProps) {
  const [activeTab, setActiveTab] = useState<ResourceType | "ALL">("CONCEPT");
  const [getFullCourse, setGetFullCourse] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, resources, errors, refresh] = useQuery(
    "getResourcesByUnitTags",
    {
      courseId,
      unitId,
      getFullCourse,
    },
  );

  const hasEditPermission = useAuthHasPerm("EDIT_COURSE");

  const { showModal } = useModal();

  const hasResources = resources?.resources && resources.resources.length > 0;

  const filteredResources = hasResources
    ? resources.resources.filter((resource) => {
        const typeMatch = activeTab === "ALL" || resource.type === activeTab;

        if (!searchTerm) return typeMatch;

        const searchTermLower = searchTerm.toLowerCase();
        return (
          typeMatch &&
          (resource.title.toLowerCase().includes(searchTermLower) ||
            resource.description.toLowerCase().includes(searchTermLower) ||
            resource.url.toLowerCase().includes(searchTermLower))
        );
      })
    : [];

  const hasFilteredResources = filteredResources.length > 0;

  return (
    <aside className="hidden w-96 bg-dark-alt p-4 shrink-0 h-full md:flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">Recursos</h2>
        <div className="flex items-center">
          <label className="flex items-center mr-2 cursor-pointer select-none">
            <span className="mr-2 text-xs text-gray-300">
              {getFullCourse ? "Todo el curso" : "Solo esta unidad"}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={getFullCourse}
                onChange={() => {
                  setGetFullCourse((v) => !v);
                }}
                className="sr-only"
                id="toggle-full-course"
              />
              <div
                className={clx(
                  "block w-10 h-6 rounded-full transition-colors",
                  getFullCourse ? "bg-primary" : "bg-gray-600",
                )}
              ></div>
              <div
                className={clx(
                  "dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                  getFullCourse ? "translate-x-4" : "",
                )}
              ></div>
            </div>
          </label>
          {hasEditPermission && (
            <Button
              className="text-primary"
              onClick={() => {
                const [close] = showModal(
                  <AddResourceModal
                    courseId={courseId}
                    refresh={refresh}
                    closeModal={() => {
                      close();
                    }}
                  />,
                );
              }}
              title="Agregar recurso"
            >
              <Icon name="bx-plus" className="text-xl" />
            </Button>
          )}
          {hasEditPermission && (
            <Button
              className="text-primary"
              onClick={() => {
                const [close] = showModal(
                  <BulkAddResourceModal
                    courseId={courseId}
                    refresh={refresh}
                    closeModal={() => {
                      close();
                    }}
                  />,
                );
              }}
              title="Agregar recurso"
            >
              <Icon name="bx-add-to-queue" className="text-xl" />
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex-grow flex justify-center items-center">
          <LoadingSpinner className="text-primary text-4xl sm:text-6xl" />
        </div>
      )}

      {errors && (
        <div className="p-4 bg-red-800 rounded-md text-red-200">
          Error al cargar los recursos: {errors.message}
        </div>
      )}

      {hasResources && !isLoading && !errors && (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => {
                  if (e.target.value.length > 0 && activeTab !== "ALL") {
                    setActiveTab("ALL");
                  }
                  setSearchTerm(e.target.value);
                }}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-primary"
              />
              <Icon
                name="bx-search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {Object.entries(resourceTypeDisplayMap).map(([type, { label }]) => (
              <button
                key={type}
                onClick={() => {
                  setActiveTab(type as ResourceType);
                }}
                className={clx(
                  "px-3 py-1 text-sm whitespace-nowrap rounded-md",
                  activeTab === type
                    ? "bg-primary text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700",
                )}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => {
                setActiveTab("ALL");
              }}
              className={clx(
                "px-3 py-1 text-sm whitespace-nowrap rounded-md mr-2",
                activeTab === "ALL"
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700",
              )}
            >
              Todos
            </button>
          </div>

          <div className="overflow-y-auto flex-grow">
            {hasFilteredResources ? (
              <div className="space-y-4">
                {filteredResources.map((resource) => (
                  <div key={resource.id} className="p-3 bg-gray-800 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">
                        {resource.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {hasEditPermission && (
                          <Button
                            onClick={() => {
                              const [close] = showModal(
                                <EditResourceModal
                                  resource={resource}
                                  closeModal={() => {
                                    close();
                                  }}
                                  refresh={refresh}
                                />,
                              );
                            }}
                            className="text-primary px-3 py-2 flex items-center"
                            title="Editar Título de Unidad"
                          >
                            <Icon name="bx-edit" />
                          </Button>
                        )}
                        {activeTab === "ALL" && (
                          <span
                            className={clx(
                              "text-xs px-2 py-1 rounded",
                              resourceTypeDisplayMap[resource.type].className,
                            )}
                          >
                            {resourceTypeDisplayMap[resource.type].label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      <MarkdownContent content={resource.description} />
                    </div>
                    <div className="mt-2">
                      <Anchor
                        href={resource.url}
                        className="text-primary hover:text-primary-light text-sm"
                        external
                      >
                        Ver recurso
                        <Icon name="bx-link-external" className="inline" />
                      </Anchor>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-800 rounded-md text-gray-300">
                No hay recursos que coincidan con los filtros seleccionados.
              </div>
            )}
          </div>
        </div>
      )}

      {!isLoading && !errors && !hasResources && (
        <div className="p-4 bg-gray-800 rounded-md text-gray-300">
          No hay recursos disponibles para esta unidad.
        </div>
      )}
    </aside>
  );
}
