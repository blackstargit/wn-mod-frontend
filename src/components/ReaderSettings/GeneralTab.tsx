import React from "react";
import { Sun, Maximize, Minimize } from "lucide-react";
import NavigationControls from "./NavigationControls";

interface GeneralTabProps {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  brightness: number;
  onBrightnessChange: (value: number) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

/**
 * General tab: navigation, brightness, and reading width controls
 */
const GeneralTab: React.FC<GeneralTabProps> = ({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  brightness,
  onBrightnessChange,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="space-y-6">
      <NavigationControls
        onPrev={onPrev}
        onNext={onNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      {/* Brightness */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Sun className="w-4 h-4" />
          Brightness
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => onBrightnessChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <span className="text-white font-mono text-sm w-12 text-right">
            {brightness}%
          </span>
        </div>
      </div>

      {/* Reading Width */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">
          Reading Width
        </h3>
        <button
          onClick={onToggleFullscreen}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
            isFullscreen
              ? "bg-purple-600/20 border border-purple-500/50"
              : "bg-slate-900/50 border border-slate-700/50 hover:bg-slate-700/30"
          }`}
        >
          <span className="text-white font-medium flex items-center gap-2">
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4" />
                Reduce Size
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4" />
                Increase Screen Size
              </>
            )}
          </span>
          <div
            className={`w-12 h-6 rounded-full transition-colors ${
              isFullscreen ? "bg-purple-600" : "bg-slate-600"
            } relative`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isFullscreen ? "translate-x-6" : ""
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default GeneralTab;
