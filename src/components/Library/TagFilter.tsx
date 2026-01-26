import React, { useState, useRef, useEffect } from "react";
import type { Tag } from "../../types";
import { Search, X, ChevronDown } from "lucide-react";

interface TagFilterProps {
  tags: Tag[];
  selectedTags: number[];
  onToggleTag: (tagId: number) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  selectedTags,
  onToggleTag,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedTagObjects = tags.filter((tag) =>
    selectedTags.includes(tag.id),
  );

  return (
    <div className="relative w-full md:w-auto min-w-[250px]" ref={wrapperRef}>
      <div
        className="flex items-center gap-2 bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4 text-slate-400 shrink-0" />

        <div className="flex flex-wrap gap-2 flex-1 items-center">
          {selectedTagObjects.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 text-xs bg-purple-600/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-500/30"
            >
              # {tag.name}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTag(tag.id);
                }}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={selectedTags.length === 0 ? "Filter by tags..." : ""}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="bg-transparent border-none outline-none text-sm placeholder-slate-400 min-w-[100px] flex-1"
          />
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-white"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {filteredTags.length === 0 ? (
            <div className="p-3 text-slate-500 text-sm text-center">
              No tags found
            </div>
          ) : (
            filteredTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => onToggleTag(tag.id)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-700 transition-colors ${
                    isSelected
                      ? "bg-purple-600/10 text-purple-300"
                      : "text-slate-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tag.name}</span>
                    <span className="text-xs text-slate-500 bg-slate-800 px-1.5 rounded-full">
                      {tag.count}
                    </span>
                  </span>
                  {isSelected && <span className="text-purple-400">✓</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TagFilter;
