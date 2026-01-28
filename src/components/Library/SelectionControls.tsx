import React, { useState } from "react";
import { CheckSquare, Square, Trash2, X, Folder, ChevronDown } from "lucide-react";
import type { SelectionControlsProps } from "@/types";

const SelectionControls: React.FC<SelectionControlsProps> = ({
  isSelectionMode,
  selectedCount,
  totalCount,
  onEnterSelectionMode,
  onExitSelectionMode,
  onSelectAll,
  onBulkDelete,
  categories = [],
  onBulkAssignCategory,
}) => {
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  if (!isSelectionMode) {
    return (
      <button
        onClick={onEnterSelectionMode}
        className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[var(--color-accent-dark)]/60"
      >
        <CheckSquare className="w-4 h-4 " />
        Select Multiple
      </button>
    );
  }

  const handleCategorySelect = (categoryId: number) => {
    if (onBulkAssignCategory) {
      onBulkAssignCategory(categoryId);
    }
    setShowCategoryDropdown(false);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onSelectAll}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
      >
        {selectedCount === totalCount ? (
          <>
            <Square className="w-4 h-4" />
            Deselect All
          </>
        ) : (
          <>
            <CheckSquare className="w-4 h-4" />
            Select All
          </>
        )}
      </button>

      {/* Bulk Category Assignment Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          disabled={selectedCount === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          <Folder className="w-4 h-4" />
          Move to Category ({selectedCount})
          <ChevronDown className="w-4 h-4" />
        </button>

        {showCategoryDropdown && selectedCount > 0 && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowCategoryDropdown(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
              {categories.length === 0 ? (
                <div className="px-4 py-3 text-slate-400 text-sm">
                  No categories available
                </div>
              ) : (
                categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors text-white border-b border-slate-700/50 last:border-b-0 flex items-center gap-2"
                  >
                    <Folder className="w-4 h-4 text-slate-400" />
                    {category.name}
                    <span className="ml-auto text-xs text-slate-500">
                      ({category.count})
                    </span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onBulkDelete}
        disabled={selectedCount === 0}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete Selected ({selectedCount})
      </button>

      <button
        onClick={onExitSelectionMode}
        className="btn-secondary flex items-center gap-2"
      >
        <X className="w-4 h-4" />
        Cancel
      </button>
    </div>
  );
};

export default SelectionControls;
