import React, { useState, useRef, useEffect } from "react";
import { useLocalStorage } from "@/hooks";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { useTTS } from "@/contexts/TTSContext";

const TTSPlayer: React.FC = () => {
  const tts = useTTS();
  const [isMinimized, setIsMinimized] = useLocalStorage<boolean>(
    "ttsPlayerMinimized",
    false,
  );
  const [position, setPosition] = useLocalStorage<{ x: number; y: number }>(
    "ttsPlayerPosition",
    { x: window.innerWidth / 2 - 200, y: window.innerHeight - 150 },
  );

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const playerRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!tts.isPlaying) {
    return null;
  }

  return (
    <div
      ref={playerRef}
      className={`fixed z-50 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className={`bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl transition-all duration-300 ${
          isMinimized ? "p-2" : "p-4"
        }`}
        onMouseDown={handleMouseDown}
      >
        {isMinimized ? (
          // Minimalist Mode - Only icon buttons
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                tts.previousParagraph();
              }}
              disabled={tts.currentParagraphIndex === 0}
              className="p-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              title="Previous paragraph"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                tts.isPaused ? tts.resume() : tts.pause();
              }}
              className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
              title={tts.isPaused ? "Resume" : "Pause"}
            >
              {tts.isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                tts.nextParagraph();
              }}
              disabled={tts.currentParagraphIndex === tts.totalParagraphs - 1}
              className="p-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              title="Next paragraph"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-700/50 mx-1" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Expand"
            >
              <Maximize2 className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                tts.stop();
              }}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Stop and close"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        ) : (
          // Full Mode - Complete player
          <div className="min-w-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-300">
                  Text to Speech
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(true);
                  }}
                  className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    tts.stop();
                  }}
                  className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
                  title="Stop and close"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
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
                onClick={(e) => {
                  e.stopPropagation();
                  tts.previousParagraph();
                }}
                disabled={tts.currentParagraphIndex === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                title="Previous paragraph"
              >
                <SkipBack className="w-4 h-4" />
                <span className="text-sm font-medium">Prev</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  tts.isPaused ? tts.resume() : tts.pause();
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  tts.nextParagraph();
                }}
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
        )}
      </div>
    </div>
  );
};

export default TTSPlayer;
