import { clx } from "../../../utils/styles/clx.ts";
import { useControls } from "../use-controls.ts";

export interface FormSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  className?: string;
}

export interface FormSelectProps {
  label: string;
  name: string;
  options: FormSelectOption[];
  className?: string;
}

export function Select({
  label,
  name,
  options,
  className = "",
}: FormSelectProps) {
  const {
    shouldShowError,
    updateRequest,
    isLoading,
    value,
    errorMessage,
    setIsTouched,
  } = useControls<string>(name);

  return (
    <div className={clx("flex flex-col gap-1 items-stretch", className)}>
      <label htmlFor={name} className={clx(shouldShowError && "text-danger")}>
        {label}
      </label>
      <select
        className={clx(
          "border rounded-md p-2 outline-none",
          shouldShowError ? "border-red-700" : "border-gray-600",
        )}
        name={name}
        id={name}
        disabled={isLoading}
        value={value}
        onChange={(e) => {
          updateRequest(e.target.value);
        }}
        onBlur={() => {
          setIsTouched(true);
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={option.className}
          >
            {option.label}
          </option>
        ))}
      </select>
      {shouldShowError && <p className="text-danger text-sm">{errorMessage}</p>}
    </div>
  );
}
