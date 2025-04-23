import { useEffect, useState } from "react";

export type Breakpoint = "sm" | "md" | "lg" | "xl";

export const BREAKPOINTS_SIZES: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

const BREAKPOINTS: Breakpoint[] = ["sm", "md", "lg", "xl"];

export function isBreakPointActive(
  targetBreakPoint: Breakpoint,
  currentBreakPoint: Breakpoint,
): boolean {
  const targetBreakPointIndex = BREAKPOINTS.indexOf(targetBreakPoint);
  const currentBreakPointIndex = BREAKPOINTS.indexOf(currentBreakPoint);

  return targetBreakPointIndex <= currentBreakPointIndex;
}

function getCurrentBreakpoint(): Breakpoint {
  return (
    (Object.keys(BREAKPOINTS_SIZES).find(
      (key) => window.innerWidth <= BREAKPOINTS_SIZES[key as Breakpoint],
    ) as Breakpoint | undefined) ?? BREAKPOINTS[BREAKPOINTS.length - 1]
  );
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(
    getCurrentBreakpoint(),
  );

  useEffect(() => {
    function handleResize() {
      setBreakpoint(getCurrentBreakpoint());
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return breakpoint;
}
