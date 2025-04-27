import type { UUID } from "@fabric/core";
import type { ResourceType } from "@ulthar/academy-domain";
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
  REQUIRED_READING: {
    label: "Lectura obligatoria",
    className: "bg-red-900 text-white",
  },
  RECOMMENDED_READING: {
    label: "Lectura recomendada",
    className: "bg-blue-900 text-white",
  },
  VIDEO: {
    label: "Video",
    className: "bg-purple-900 text-white",
  },
  CONCEPT: {
    label: "Concepto",
    className: "bg-green-900 text-white",
  },
  DOCUMENTATION: {
    label: "Documentación",
    className: "bg-amber-900 text-white",
  },
};

export function ResourceSidebar({ courseId, unitId }: ResourceSidebarProps) {
  const [isLoading, resources, errors] = useQuery("getResourcesByUnitTags", {
    courseId,
    unitId,
  });

  const hasResources = resources?.resources && resources.resources.length > 0;

  return (
    <aside className="hidden lg:block w-96 bg-dark-alt p-4 overflow-y-auto shrink-0 h-full">
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

      {hasResources && (
        <div className="space-y-4">
          {resources.resources.map((resource) => (
            <div key={resource.id} className="p-3 bg-gray-800 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{resource.title}</h3>
                <span
                  className={clx(
                    "text-xs px-2 py-1 rounded",
                    resourceTypeDisplayMap[resource.type].className,
                  )}
                >
                  {resourceTypeDisplayMap[resource.type].label}
                </span>
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
      )}

      {!isLoading && !errors && !hasResources && (
        <div className="p-4 bg-gray-800 rounded-md text-gray-300">
          No hay recursos disponibles para esta unidad.
        </div>
      )}
    </aside>
  );
}
