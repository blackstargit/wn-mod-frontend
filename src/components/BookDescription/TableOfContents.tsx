import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ChapterVolume } from "@/types/bookDescription";
import { useChapterParsing } from "@/hooks/useChapterParsing";

interface TableOfContentsProps {
  toc: ChapterVolume[];
  expandedVolumes: Record<number, boolean>;
  setExpandedVolumes: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
}

/**
 * Collapsible Table of Contents with volumes and chapters
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({
  toc,
  expandedVolumes,
  setExpandedVolumes,
}) => {
  const [isTocExpanded, setIsTocExpanded] = useState(true);
  const { parseChapterTitle } = useChapterParsing();

  return (
    <div className="border border-slate-700/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsTocExpanded(!isTocExpanded)}
        className="w-full flex items-center justify-between p-4 bg-slate-900/50 hover:bg-slate-700/50 transition-colors"
      >
        <h2 className="text-xl font-bold text-white">Table of Contents</h2>
        {isTocExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isTocExpanded && (
        <div className="p-4 bg-slate-900/20">
          <div className="space-y-4">
            {toc.map((volume, volumeIndex) => (
              <div
                key={volumeIndex}
                className="border border-slate-700/30 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => {
                    setExpandedVolumes((prev) => ({
                      ...prev,
                      [volumeIndex]: !prev[volumeIndex],
                    }));
                  }}
                  className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
                >
                  <h3 className="font-semibold text-purple-400">
                    {volume.volume}
                  </h3>
                  {expandedVolumes[volumeIndex] ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {expandedVolumes[volumeIndex] && (
                  <div className="p-2 space-y-2 bg-slate-900/40">
                    {volume.chapters.map((chapter, chapterIndex) => {
                      const { index, title, date } = parseChapterTitle(
                        chapter.title,
                      );
                      return (
                        <a
                          key={chapterIndex}
                          href={chapter.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-between p-3 rounded-lg transition-all group ${
                            chapter.is_locked
                              ? "bg-slate-900/30 text-slate-500 cursor-not-allowed"
                              : "bg-slate-900/30 hover:bg-slate-800/50 text-slate-300 hover:text-white border border-slate-700/30 hover:border-purple-500/50"
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {index && (
                              <span className="text-slate-500 font-mono text-sm min-w-[2rem]">
                                {index}
                              </span>
                            )}
                            <span
                              className={`truncate ${chapter.is_locked ? "" : "group-hover:text-white"}`}
                            >
                              {title || chapter.title}
                            </span>
                          </div>
                          {date && (
                            <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                              {date}
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOfContents;
