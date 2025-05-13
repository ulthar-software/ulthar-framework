import type { UUID } from "@fabric/core";
import type { Tag } from "@ulthar/academy-domain";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "../../../utils/rpc/use-query";
import { clx } from "../../../utils/styles/clx";
import { useControls } from "../use-controls";

interface TagSelectProps {
  name: string;
  label: string;
  className?: string;
  placeholder?: string;
}

export function TagSelect({
  name,
  label,
  className = "",
  placeholder = "Search tags...",
}: TagSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    shouldShowError,
    updateRequest,
    isLoading,
    value: selectedTags = [],
    errorMessage,
  } = useControls<UUID[]>(name);

  const [tagsLoading, tags, error] = useQuery("getTags", {
    filter: searchTerm,
  });

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

  return (
    <div className={clx("flex flex-col", className)} ref={dropdownRef}>
      <label htmlFor={name} className={clx(shouldShowError && "text-red-700")}>
        {label}
      </label>
      <input
        className="border rounded-md p-2 outline-none"
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
      {tagsLoading && <p>Loading...</p>}
      {error && <p className="text-red-700">Error loading tags</p>}
      {shouldShowError && (
        <p className="text-red-700 text-sm">{errorMessage}</p>
      )}
      {isDropdownOpen && (
        <ul className="border rounded-md max-h-48 overflow-y-auto bg-white shadow-md">
          {filteredTags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
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
              <label htmlFor={`${name}-${tag.id}`}>{tag.name}</label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
