import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface ReaderNavigationProps {
  bookId: string;
  onPrevious: () => void;
  onNext: () => void;
  onToggleSidebar: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  //   sidebarOpen: boolean;
}

/**
 * Navigation controls for the reader (Previous, Next, Settings)
 * Merged with TopBar functionality (Library/Description links)
 */
const ReaderNavigation: React.FC<ReaderNavigationProps> = ({
  bookId,
  onPrevious,
  onNext,
  onToggleSidebar,
  hasPrevious,
  hasNext,
  //   sidebarOpen,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 items-center my-4 mb-10">
      {/* Left: Previous Button */}
      <div className="justify-self-start">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-slate-700/50 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
      </div>

      {/* Center: Library / Description Links */}
      <div className="justify-self-center flex items-center gap-6">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm font-medium"
        >
          📚 Library
        </button>
        <div className="w-px h-4 bg-slate-700/50" />
        <button
          onClick={() => navigate(`/book/${bookId}`)}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm font-medium"
        >
          <BookOpen className="w-4 h-4" />
          Description
        </button>
      </div>

      {/* Right: Next + Settings */}
      <div className="justify-self-end flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-700/50"
          title="Reader Settings"
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
