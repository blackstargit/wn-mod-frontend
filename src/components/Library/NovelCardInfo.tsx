import React from "react";
import type { Novel } from "../../types";

interface NovelCardInfoProps {
  novel: Novel;
}

const NovelCardInfo: React.FC<NovelCardInfoProps> = ({ novel }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently added";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-xs text-slate-400 mb-4 flex-1 content-start">
      <div className="flex flex-wrap justify-between pt-3 pe-3">
        <div>
          <span className="text-slate-500 block mb-0.5">Chapters</span>
          <span className="text-slate-200 font-medium">
            {novel.total_chapters}
          </span>
        </div>
        {/* Last Local Access */}
        {novel.last_accessed_at && (
          <div>
            <span className="text-slate-500 block mb-0.5">Last read</span>
            <span className="text-blue-300 ">
              {formatDate(novel.last_accessed_at)}
            </span>
          </div>
        )}
        <div>
          <span className="text-slate-500 block mb-0.5">Added</span>
          <span className="text-slate-200">{formatDate(novel.created_at)}</span>
        </div>
      </div>

      {/* Webnovel Progress */}
      {(novel.progress > 0 || novel.total_chapters_webnovel > 0) && (
        <div className="col-span-2 pt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-500">Webnovel Progress</span>
            <span className="text-purple-300 font-medium">
              {novel.progress}
              <span className="text-slate-600">
                {" "}
                / {novel.total_chapters_webnovel}
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (novel.progress / (novel.total_chapters_webnovel || 1)) * 100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelCardInfo;
