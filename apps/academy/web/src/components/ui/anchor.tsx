import type { PropsWithChildren } from "react";
import { Link } from "react-router";

export interface AnchorProps extends PropsWithChildren {
  href: string;
  className?: string;
  external?: boolean;
}

/**
 * Anchor component that renders either a React Router Link or a regular anchor tag
 * based on whether the link is external or not.
 */
export function Anchor({
  href,
  children,
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
      >
        {children}
      </Link>
    );
  }

  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}
