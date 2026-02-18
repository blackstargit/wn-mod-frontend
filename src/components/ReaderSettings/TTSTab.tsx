import React from "react";
import { Volume2 } from "lucide-react";

interface TTSTabProps {
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  playbackRate: number;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  onPlaybackRateChange: (rate: number) => void;
  onStartTTS: () => void;
}

const SPEED_PRESETS = [0.75, 1.0, 1.25, 1.5];

/**
 * TTS tab: voice selection, playback speed, and start button
 */
const TTSTab: React.FC<TTSTabProps> = ({
  availableVoices,
  selectedVoice,
  playbackRate,
  onVoiceChange,
  onPlaybackRateChange,
  onStartTTS,
}) => {
  const offlineVoices = availableVoices.filter((v) => v.localService !== false);
  const onlineVoices = availableVoices.filter((v) => v.localService === false);

  return (
    <div className="space-y-6">
      {/* Voice Selection */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Voice</h3>
        <select
          value={selectedVoice?.name || ""}
          onChange={(e) => {
            const voice = availableVoices.find(
              (v) => v.name === e.target.value,
            );
            if (voice) onVoiceChange(voice);
          }}
          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50"
        >
          {availableVoices.length === 0 && <option>Loading voices...</option>}

          {offlineVoices.length > 0 && (
            <optgroup label="🔒 Offline Voices (Work without internet)">
              {offlineVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </optgroup>
          )}

          {onlineVoices.length > 0 && (
            <optgroup label="🌐 Online Voices (Require internet)">
              {onlineVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <p className="mt-2 text-xs text-slate-400">
          {offlineVoices.length} offline, {onlineVoices.length} online
        </p>
      </div>

      {/* Playback Speed */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">
          Playback Speed
        </h3>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <span className="text-white font-mono text-sm w-12 text-right">
            {playbackRate.toFixed(1)}x
          </span>
        </div>

        {/* Speed preset buttons */}
        <div className="grid grid-cols-4 gap-2">
          {SPEED_PRESETS.map((rate) => (
            <button
              key={rate}
              onClick={() => onPlaybackRateChange(rate)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                playbackRate === rate
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/50"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Start TTS */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">
          Text to Speech
        </h3>
        <button
          onClick={onStartTTS}
          disabled={!selectedVoice}
          className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-400 rounded-lg transition-colors border border-blue-500/30"
        >
          <Volume2 className="w-5 h-5" />
          <span className="font-semibold">Start Text to Speech</span>
        </button>
        <p className="mt-3 text-xs text-slate-400">
          Click to start reading the current chapter aloud using your browser's
          text-to-speech engine.
        </p>
      </div>
    </div>
  );
};

export default TTSTab;
