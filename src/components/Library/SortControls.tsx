import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SortOption, SortControlsProps } from "@/types";

const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}) => {
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-slate-300 text-sm font-medium flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4" />
        Sort by:
      </label>

      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as SortOption)}
        className="bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
      >
        <option value="recently-read">Recently Read</option>
        <option value="date-added">Date Added</option>
        <option value="by-category">By Category</option>
        <option value="by-tag">By Tag</option>
      </select>

      <button
        onClick={toggleSortOrder}
        className="btn-secondary flex items-center gap-2 rounded-lg px-3 py-1.5 border-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
        title={`Sort order: ${sortOrder === "desc" ? "Descending" : "Ascending"}`}
      >
        {sortOrder === "desc" ? (
          <>
            <ArrowDown className="w-4 h-4" />
            Desc
          </>
        ) : (
          <>
            <ArrowUp className="w-4 h-4" />
            Asc
          </>
        )}
      </button>
    </div>
  );
};

export default SortControls;
