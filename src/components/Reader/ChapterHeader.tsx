import React from "react";

interface ChapterHeaderProps {
  title: string;
  currentIndex: number;
  totalChapters: number;
  novelTitle?: string;
}

/**
 * Chapter header with title and progress information
 */
const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  title,
  currentIndex,
  totalChapters,
  novelTitle,
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold mb-2 text-white">{title}</h1>
      <div className="flex items-center gap-4 text-slate-400">
        <p>
          Chapter {currentIndex} of {totalChapters}
        </p>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          Progress Saved
        </span>
        {novelTitle && <p className="text-sm text-slate-500">({novelTitle})</p>}
      </div>
    </div>
  );
};

export default ChapterHeader;
