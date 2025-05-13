import { useNavigate } from "react-router";
import { clx } from "../../utils/styles/clx.ts";
import { PageContainer } from "../academy/page-container.tsx";
import { PlatformFooter } from "../academy/platform-footer.tsx";
import { PlatformHeader } from "../academy/platform-header.tsx";
import { Anchor } from "./anchor.tsx";
import { Button } from "./button.tsx";
import { Icon } from "./icon.tsx";

export interface UnderConstructionProps {
  /**
   * Título personalizado para la página en construcción.
   * @default "Página en construcción"
   */
  title?: string;

  /**
   * Mensaje personalizado para mostrar en la página.
   * @default "Estamos trabajando en esta sección. Pronto estará disponible."
   */
  message?: string;

  /**
   * Clase CSS adicional para personalizar el contenedor.
   */
  className?: string;
}

/**
 * Componente para mostrar una página en construcción.
 * Sigue el estilo del resto del sitio con tema oscuro.
 */
export function UnderConstructionPage({
  title = "Página en construcción",
  message = "Estamos trabajando en esta sección. Pronto estará disponible.",
  className,
}: UnderConstructionProps) {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PlatformHeader />
      <div
        className={clx(
          "flex flex-col items-center justify-center grow bg-dark px-4",
          className,
        )}
      >
        <div className="text-center">
          <div className="flex justify-center">
            <Icon name="bx-hard-hat" className="text-6xl text-primary mb-4" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">{title}</h1>
          <p className="text-xl text-gray-300 mb-8">{message}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <Icon name="bx-arrow-back" className="text-xl" />
                <span>Volver atrás</span>
              </div>
            </Button>
            <Anchor
              href="/"
              className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <Icon name="bx-home" className="text-xl" />
                <span>Ir al inicio</span>
              </div>
            </Anchor>
          </div>
        </div>
      </div>
      <PlatformFooter />
    </PageContainer>
  );
}
