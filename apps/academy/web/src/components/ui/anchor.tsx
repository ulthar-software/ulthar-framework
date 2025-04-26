import type { PropsWithChildren } from "react";
import { Link } from "react-router";

export interface AnchorProps extends PropsWithChildren {
  href: string;
  className?: string;
  external?: boolean;
  onClick?: () => void;
}

/**
 * Anchor component that renders either a React Router Link or a regular anchor tag
 * based on whether the link is external or not.
 */
export function Anchor({
  href,
  children,
  onClick,
  className = "",
  external = false,
}: AnchorProps) {
  if (external) {
    return (
      <Link
        to={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
