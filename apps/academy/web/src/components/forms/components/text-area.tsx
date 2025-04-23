import { clx } from "../../../utils/styles/clx.ts";
import { useControls } from "../use-controls.ts";

export interface FormTextAreaProps {
  label: string;
  name: string;
  maxChars?: number;
  className?: string;
}

export function TextArea({
  label,
  name,
  maxChars,
  className = "",
}: FormTextAreaProps) {
  const {
    shouldShowError,
    updateRequest,
    isLoading,
    value,
    errorMessage,
    setIsTouched,
  } = useControls<string>(name);

  return (
    <div className={clx("flex flex-col", className)}>
      <label htmlFor={name} className={clx(shouldShowError && "text-red-700")}>
        {label}
      </label>
      <textarea
        disabled={isLoading}
        className={clx(
          "h-32 border rounded-md p-2 outline-none resize-none",
          shouldShowError ? "border-red-700" : "border-gray-600",
        )}
        name={name}
        id={name}
        value={value ?? ""}
        onChange={(evt) => {
          updateRequest(evt.target.value);
        }}
        onBlur={() => {
          setIsTouched(true);
        }}
      />
      {maxChars && (
        <p
          style={{
            textAlign: "right",
          }}
        >
          {value?.length ?? 0} / {maxChars}
        </p>
      )}
      {shouldShowError && (
        <p className="text-red-700 text-sm">{errorMessage}</p>
      )}
    </div>
  );
}
