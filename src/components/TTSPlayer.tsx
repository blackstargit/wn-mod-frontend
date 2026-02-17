import React from "react";
import { Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { useTTS } from "@/contexts/TTSContext";

const TTSPlayer: React.FC = () => {
  const tts = useTTS();

  if (!tts.isPlaying) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl p-4 min-w-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-300">
              Text to Speech
            </span>
          </div>
          <button
            onClick={tts.stop}
            className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Stop and close"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Paragraph</span>
            <span>
              {tts.currentParagraphIndex + 1} of {tts.totalParagraphs}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{
                width: `${((tts.currentParagraphIndex + 1) / tts.totalParagraphs) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={tts.previousParagraph}
            disabled={tts.currentParagraphIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            title="Previous paragraph"
          >
            <SkipBack className="w-4 h-4" />
            <span className="text-sm font-medium">Prev</span>
          </button>

          <button
            onClick={tts.isPaused ? tts.resume : tts.pause}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
            title={tts.isPaused ? "Resume" : "Pause"}
          >
            {tts.isPaused ? (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium">Pause</span>
              </>
            )}
          </button>

          <button
            onClick={tts.nextParagraph}
            disabled={tts.currentParagraphIndex === tts.totalParagraphs - 1}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            title="Next paragraph"
          >
            <span className="text-sm font-medium">Next</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed indicator */}
        <div className="mt-3 text-center">
          <span className="text-xs text-slate-400">
            Speed: {tts.playbackRate.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
};

export default TTSPlayer;
