import type { ChangeEvent, PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button.tsx";
import { LoadingSpinner } from "../../ui/loading-spinner.tsx";
import { useControls } from "../use-controls.ts";

export interface FileInputProps {
  name: string;
  className?: string;
  btnClassName?: string;
  accept?: string;
  value?: File[];
  onChange?: (value: File[]) => void;
  multiple?: boolean;
}

export function FileInputButton({
  name,
  className,
  value,
  onChange,
  accept = "*",
  children,
  multiple = false,
}: PropsWithChildren<FileInputProps>) {
  const {
    value: internalValue,
    isLoading,
    setIsTouched,
    updateRequest,
  } = useControls<File | File[]>(name);

  const [selectedFiles, setSelectedFiles] = useState<File[]>(
    getInitialValue(value, internalValue),
  );

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    if (internalValue && multiple)
      setSelectedFiles(
        Array.isArray(internalValue) ? internalValue : [internalValue],
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalValue]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      setIsButtonDisabled(true);
      const uploadedFileArray = Array.from(files);

      const newSelectedFiles = [...selectedFiles, ...uploadedFileArray];
      setSelectedFiles(newSelectedFiles);
      if (!multiple) {
        updateRequest(newSelectedFiles[newSelectedFiles.length - 1]);
      } else {
        updateRequest([...newSelectedFiles]);
      }
      if (onChange) onChange(newSelectedFiles);
      setIsButtonDisabled(false);
    }
  };

  useEffect(() => {
    setSelectedFiles(value ?? []);
    onChange?.(value ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.length]);

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
      setIsTouched(true);
    }
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        name={name}
        id={name}
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        disabled={isLoading}
        onChange={handleFileChange}
        multiple={multiple}
      />
      <Button
        className={className}
        onClick={handleButtonClick}
        disabled={isLoading || isButtonDisabled}
      >
        {isButtonDisabled && <LoadingSpinner />}
        {children}
      </Button>
    </>
  );
}

function getInitialValue(
  value: File[] | File | undefined,
  internalValue: File | File[] | undefined,
): File[] {
  if (value) {
    if (Array.isArray(value)) {
      return value;
    }
    return [value];
  }

  if (internalValue) {
    if (Array.isArray(internalValue)) {
      return internalValue;
    }
    return [internalValue];
  }

  return [];
}
