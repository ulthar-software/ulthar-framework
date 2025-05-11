import { PosixDate } from "@fabric/core";
import { clx } from "../../../utils/styles/clx.ts";
import { useControls } from "../use-controls";

export type InputType = "text" | "email" | "password" | "number" | "date";

export interface InputProps {
  label: string;
  name: string;
  type: InputType;
  className?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string | number | PosixDate;
}

export function Input({
  label,
  type,
  name,
  className = "",
  placeholder = "",
  onChange,
  defaultValue,
}: InputProps) {
  const {
    shouldShowError,
    updateRequest,
    isLoading,
    value,
    errorMessage,
    setIsTouched,
  } = useControls(name);

  return (
    <div className={clx(`flex flex-col items-stretch`, className)}>
      <label htmlFor={name} className={clx(shouldShowError && "text-red-700")}>
        {label}
      </label>

      <input
        className={clx(
          shouldShowError ? "border-red-700" : "border-gray-600",
          "border rounded-md p-2 outline-none",
        )}
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        disabled={isLoading}
        value={valueToString(value !== undefined ? value : defaultValue)}
        onChange={(e) => {
          updateRequest(stringToValue(e.target.value, type));
          if (onChange) onChange(e);
        }}
        onBlur={() => {
          setIsTouched(true);
        }}
      />
      {shouldShowError && (
        <p className="text-red-700 text-sm">{errorMessage}</p>
      )}
    </div>
  );
}
function stringToValue(value: string, type: InputType): unknown {
  if (type === "number") {
    return parseFloat(value);
  }
  if (type === "date") {
    return new PosixDate(Date.parse(value));
  }
  return value;
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value.toString();
  }
  if (value instanceof PosixDate) {
    return value.getDateString();
  }
  return JSON.stringify(value);
}
