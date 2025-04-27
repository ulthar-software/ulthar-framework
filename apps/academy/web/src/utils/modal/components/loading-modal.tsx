import { LoadingSpinner } from "../../../components/ui/loading-spinner.tsx";

export function LoadingModal() {
  return (
    <article className="bg-dark-alt rounded p-4 flex flex-col gap-2 max-w-md w-11/12">
      <LoadingSpinner className="text-2xl" />
    </article>
  );
}
