import type { UUID } from "@fabric/core";
import type { ResourceType } from "@ulthar/academy-domain";
import { useState } from "react";
import { useQuery } from "../../utils/rpc/use-query.ts";
import { clx } from "../../utils/styles/clx.ts";
import { Anchor } from "../ui/anchor.tsx";
import { Icon } from "../ui/icon.tsx";
import { LoadingSpinner } from "../ui/loading-spinner.tsx";

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
};

export function ResourceSidebar({ courseId, unitId }: ResourceSidebarProps) {
  const [activeTab, setActiveTab] = useState<ResourceType | "ALL">("CONCEPT");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, resources, errors] = useQuery("getResourcesByUnitTags", {
    courseId,
    unitId,
  });

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
    <aside className="hidden lg:block w-96 bg-dark-alt p-4 shrink-0 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-primary mb-4">Recursos</h2>

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
                    <p className="text-sm text-gray-300 mb-2">
                      {resource.description}
                    </p>
                    <div className="mt-2">
                      <Anchor
                        href={resource.url}
                        className="text-primary hover:text-primary-light text-sm"
                        external
                      >
                        Ver recurso{" "}
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
