import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface ReaderTopBarProps {
  bookId: string;
}

/**
 * Breadcrumb navigation bar for the reader
 */
const ReaderTopBar: React.FC<ReaderTopBarProps> = ({ bookId }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          📚 Library
        </button>
        <button
          onClick={() => navigate(`/book/${bookId}`)}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Description
        </button>
      </div>
    </div>
  );
};

export default ReaderTopBar;
