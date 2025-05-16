import type { UUID } from "@fabric/core";
import type { Tag, TypesWithTags } from "@ulthar/academy-domain";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "../../../utils/rpc/use-query";
import { useRPC } from "../../../utils/rpc/use-rpc.ts";
import { clx } from "../../../utils/styles/clx";
import { showErrorToast } from "../../../utils/toasts/show-error-toast.ts";
import { Button } from "../../ui/button.tsx";
import { Icon } from "../../ui/icon.tsx";
import { LoadingSpinner } from "../../ui/loading-spinner.tsx";
import { useControls } from "../use-controls";

interface TagSelectProps {
  name: string;
  label: string;
  className?: string;
  placeholder?: string;
  typeToFilter?: TypesWithTags;
  idToFilter?: UUID;
}

export function TagSelect({
  name,
  label,
  className = "",
  placeholder = "Filtrar...",
  typeToFilter,
  idToFilter,
}: TagSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [waiting, setWaiting] = useState(false);

  const {
    shouldShowError,
    updateRequest,
    isLoading,
    value: selectedTags = [],
    errorMessage,
  } = useControls<UUID[]>(name);

  const [tagsLoading, tags, error] = useQuery("getTags", {
    filter: searchTerm,
    idToFilter,
    typeToFilter,
  });

  const addTagCommand = useRPC("createTag");

  useEffect(() => {
    if (tags && Array.isArray(tags.tags)) {
      setFilteredTags(tags.tags);
    }
  }, [tags]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleTagSelection(tagId: UUID) {
    const isSelected = selectedTags.includes(tagId);
    const updatedSelection = isSelected
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    updateRequest(updatedSelection);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      // Add keyboard navigation logic here
    } else if (event.key === "Enter") {
      event.preventDefault();
      // Add selection logic here
    }
  }

  async function handleCreateTag() {
    if (searchTerm.trim() === "") return;

    setWaiting(true);

    const result = await addTagCommand({ name: searchTerm });

    if (result.isError()) {
      showErrorToast(
        `Hubo un error al crear la etiqueta ${result.value.message}`,
      );
      return;
    }

    const { tagId } = result.unwrapOrThrow();

    updateRequest([...selectedTags, tagId]);
    setSearchTerm("");
    setIsDropdownOpen(false);

    setWaiting(false);
  }

  return (
    <div className={clx("flex flex-col relative", className)} ref={dropdownRef}>
      <label htmlFor={name} className={clx(shouldShowError && "text-red-700")}>
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          className="border rounded-md p-2 outline-none flex-grow"
          type="text"
          name={`${name}-search`}
          placeholder={placeholder}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => {
            setIsDropdownOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <Button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={() => void handleCreateTag()}
          disabled={isLoading || searchTerm.trim() === "" || waiting}
        >
          {waiting ? (
            <LoadingSpinner />
          ) : (
            <Icon name="bx-plus" className="text-white" />
          )}
        </Button>
      </div>
      {tagsLoading && <p>Loading...</p>}
      {error && <p className="text-red-700">Error loading tags</p>}
      {shouldShowError && (
        <p className="text-red-700 text-sm">{errorMessage}</p>
      )}
      {isDropdownOpen && (
        <ul className="border rounded-md max-h-48 overflow-y-auto bg-dark-alt shadow-md absolute top-[65px] w-100">
          {filteredTags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-900 cursor-pointer"
              onClick={() => {
                toggleTagSelection(tag.id);
              }}
            >
              <input
                type="checkbox"
                id={`${name}-${tag.id}`}
                checked={selectedTags.includes(tag.id)}
                readOnly
              />
              <label
                htmlFor={`${name}-${tag.id}`}
                className="pointer-events-none"
              >
                {tag.name}
              </label>
            </li>
          ))}
        </ul>
      )}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filteredTags
            .filter((tag) => selectedTags.includes(tag.id))
            .map((tag) => (
              <span
                key={tag.id}
                className="bg-gray-800 text-white px-2 py-1 rounded-md"
              >
                {tag.name}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
