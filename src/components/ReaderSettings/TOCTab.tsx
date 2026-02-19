import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { useChapterParsing } from "@/hooks";

interface TocChapter {
  title: string;
  url: string;
  is_locked: boolean;
}

interface TocVolume {
  volume: string;
  chapters: TocChapter[];
}

interface TocData {
  toc: TocVolume[];
}

interface TOCTabProps {
  bookId?: string;
  tocData: TocData | null;
  tocLoading: boolean;
  expandedVolumes: Record<number, boolean>;
  onToggleVolume: (index: number) => void;
  onChapterSelect: (index: number) => void;
}

/**
 * TOC tab: expandable volumes and chapter links
 */
const TOCTab: React.FC<TOCTabProps> = ({
  tocData,
  tocLoading,
  expandedVolumes,
  onToggleVolume,
  onChapterSelect,
}) => {
  const { parseChapterTitle } = useChapterParsing();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">
          Table of Contents
        </h3>

        {tocLoading && (
          <div className="text-center text-slate-400 py-8">
            Loading table of contents...
          </div>
        )}

        {!tocLoading && !tocData && (
          <div className="text-center text-slate-400 py-8">
            No table of contents available
          </div>
        )}

        {!tocLoading && tocData?.toc && (
          <div className="space-y-3">
            {tocData.toc.map((volume, volumeIndex) => {
              return (
                <div
                  key={volumeIndex}
                  className="border border-slate-700/30 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => onToggleVolume(volumeIndex)}
                    className="w-full flex items-center justify-between p-3 bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
                  >
                    <h4 className="font-semibold text-purple-400 text-sm">
                      {volume.volume}
                    </h4>
                    {expandedVolumes[volumeIndex] ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {expandedVolumes[volumeIndex] && (
                    <div className="p-2 space-y-1 bg-slate-900/40 max-h-full overflow-y-auto">
                      {volume.chapters.map((chapter, chapterIndex) => {
                        const { index, title } = parseChapterTitle(
                          chapter.title,
                        );
                        const i = index ? parseInt(index.toString()) : 0;
                        return (
                          <button
                            key={chapterIndex}
                            onClick={() => onChapterSelect(i > 0 ? i - 1 : 0)}
                            title={title}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-all text-xs group w-full text-left ${
                              chapter.is_locked
                                ? "bg-slate-900/30 text-slate-500 cursor-not-allowed"
                                : "bg-slate-900/30 hover:bg-slate-800/50 text-slate-300 hover:text-white border border-slate-700/30 hover:border-purple-500/50"
                            }`}
                          >
                            {index && (
                              <span className="text-slate-500 font-mono text-xs min-w-[2rem]">
                                {index}
                              </span>
                            )}
                            <span className="truncate flex-1">
                              {title || chapter.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TOCTab;
