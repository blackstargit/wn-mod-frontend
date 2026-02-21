import React from "react";
import { Star, StarOff } from "lucide-react";

interface ColorPickerProps {
  label: string;
  value: string;
  favoriteColors: string[];
  onChange: (color: string) => void;
  onToggleFavorite: () => void;
}

/**
 * Reusable color picker with favorites row
 */
const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  favoriteColors,
  onChange,
  onToggleFavorite,
}) => {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-300 mb-3">{label}</h3>

      {favoriteColors.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {favoriteColors.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`w-8 h-8 rounded-lg border-2 ${
                value === color ? "border-purple-500" : "border-slate-700/50"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700/50"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500/50"
          />
          <button
            onClick={onToggleFavorite}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            {favoriteColors.includes(value) ? (
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="w-5 h-5 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
