import logoPath from "../../assets/u-logo-transparent.x256.png";
import { clx } from "../../utils/styles/clx";

export interface UltharLogoProps {
  /**
   * Additional class names to apply to the logo container.
   */
  className?: string;

  /**
   * Size variant of the logo
   * @default "medium"
   */
  size?: "small" | "medium" | "large";

  /**
   * Whether to display the text next to the logo
   * @default true
   */
  showText?: boolean;
}

/**
 * Displays the Ulthar logo with the "Ulthar Academy" text
 */
export function UltharLogo({
  className = "",
  size = "medium",
  showText = true,
}: UltharLogoProps) {
  // Define size classes for the logo and text
  const logoSizeClasses = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-2xl",
    large: "text-4xl",
  };

  return (
    <div className={clx("flex items-center gap-2", className)}>
      {/* Logo Image */}
      <div className={clx(logoSizeClasses[size])}>
        <img
          src={logoPath}
          alt="Ulthar Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text */}
      {showText && (
        <span
          className={clx("font-semibold text-primary", textSizeClasses[size])}
        >
          Ulthar Academy
        </span>
      )}
    </div>
  );
}
