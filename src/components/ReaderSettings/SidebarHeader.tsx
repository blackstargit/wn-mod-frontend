import React from "react";
import { Settings, X, Pin, PinOff } from "lucide-react";

interface SidebarHeaderProps {
  isDetached: boolean;
  onToggleDetached: () => void;
  onClose: () => void;
}

/**
 * Sidebar header with title and control buttons
 */
const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isDetached,
  onToggleDetached,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Reader Settings
      </h2>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDetached}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          title={isDetached ? "Attach sidebar" : "Detach sidebar"}
        >
          {isDetached ? (
            <Pin className="w-4 h-4 text-purple-400" />
          ) : (
            <PinOff className="w-4 h-4 text-slate-400" />
          )}
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;
