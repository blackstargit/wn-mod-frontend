import React from "react";
import { CheckSquare, Square, Trash2, X } from "lucide-react";
import type { SelectionControlsProps } from "../../types";

const SelectionControls: React.FC<SelectionControlsProps> = ({
  isSelectionMode,
  selectedCount,
  totalCount,
  onEnterSelectionMode,
  onExitSelectionMode,
  onSelectAll,
  onBulkDelete,
}) => {
  if (!isSelectionMode) {
    return (
      <button
        onClick={onEnterSelectionMode}
        className="btn-secondary flex items-center gap-2"
      >
        <CheckSquare className="w-4 h-4" />
        Select Multiple
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
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
