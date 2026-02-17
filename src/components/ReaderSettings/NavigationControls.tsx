import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationControlsProps {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Navigation controls for previous/next chapter
 */
const NavigationControls: React.FC<NavigationControlsProps> = ({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Navigation</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="col-span-1 flex items-center justify-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="col-span-1 flex items-center justify-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NavigationControls;
