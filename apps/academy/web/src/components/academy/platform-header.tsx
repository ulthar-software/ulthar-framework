import { UltharLogo } from "./ulthar-logo.tsx";

export function PlatformHeader() {
  return (
    <header className="flex p-4 gap-4 w-full shadow bg-dark-alt">
      <UltharLogo size="small" showText={false} />
    </header>
  );
}
