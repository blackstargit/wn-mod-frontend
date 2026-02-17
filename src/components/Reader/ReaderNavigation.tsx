import React from "react";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";

interface ReaderNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onToggleSidebar: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
//   sidebarOpen: boolean;
}

/**
 * Navigation controls for the reader (Previous, Next, Settings)
 */
const ReaderNavigation: React.FC<ReaderNavigationProps> = ({
  onPrevious,
  onNext,
  onToggleSidebar,
  hasPrevious,
  hasNext,
//   sidebarOpen,
}) => {
  return (
    <div className="flex justify-between items-center my-3">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-700/50 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-700/50"
        >
          <Settings className="w-5 h-5 text-slate-300" />
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-700/50 flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ReaderNavigation;
