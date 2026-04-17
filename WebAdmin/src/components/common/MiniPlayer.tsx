import React from "react";
import { Play, Pause, X, Music, Volume2, VolumeX } from "lucide-react";
import type { PlayingSong } from "../../hooks/useAudioPlayer";

interface Props {
  current: PlayingSong;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  onToggle: () => void;
  onStop: () => void;
  onSeek: (ratio: number) => void;
  onVolumeChange: (v: number) => void;
}

const fmt = (s: number) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const MiniPlayer: React.FC<Props> = ({
  current, isPlaying, progress, duration, volume,
  onToggle, onStop, onSeek, onVolumeChange,
}) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-t border-gray-700">
    {/* Cover */}
    <div className="w-9 h-9 rounded overflow-hidden bg-gray-700 flex-shrink-0">
      {current.coverUrl
        ? <img src={current.coverUrl} alt={current.title} className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center"><Music size={14} className="text-gray-500" /></div>
      }
    </div>

    {/* Title */}
    <p className="text-xs text-white font-medium truncate flex-1 min-w-0">{current.title}</p>

    {/* Progress + time */}
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-xs text-gray-400 w-8 text-right">{fmt(progress * duration)}</span>
      <div className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek((e.clientX - rect.left) / rect.width);
        }}>
        <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8">{fmt(duration)}</span>
    </div>

    {/* Volume */}
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)} className="text-gray-400 hover:text-white transition-colors">
        {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-16 h-1 accent-green-400 cursor-pointer"
      />
    </div>

    {/* Play/pause */}
    <button onClick={onToggle}
      className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
      {isPlaying ? <Pause size={14} className="text-gray-900" /> : <Play size={14} className="text-gray-900 ml-0.5" />}
    </button>

    {/* Close */}
    <button onClick={onStop} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
      <X size={14} />
    </button>
  </div>
);

export default MiniPlayer;
