import { formatTimecode } from "../../utils/formatters";

export interface PlaybackControlsProps {
  isPlaying: boolean;
  timeMs: number;
  durationMs: number;
  onToggle: () => void;
  onStop: () => void;
  onSeek: (ms: number) => void;
}

/** 时间轴播放控制：播放/暂停、回到开头、进度拖动、时间码显示。 */
export function PlaybackControls({
  isPlaying,
  timeMs,
  durationMs,
  onToggle,
  onStop,
  onSeek
}: PlaybackControlsProps) {
  const percent = durationMs > 0 ? (timeMs / durationMs) * 100 : 0;

  return (
    <div className="playback-controls">
      <button
        type="button"
        className="playback-controls__btn playback-controls__btn--primary"
        onClick={onToggle}
        disabled={durationMs <= 0}
        title={isPlaying ? "暂停（空格）" : "播放（空格）"}
      >
        {isPlaying ? "⏸ 暂停" : "▶ 播放"}
      </button>
      <button
        type="button"
        className="playback-controls__btn"
        onClick={onStop}
        disabled={durationMs <= 0}
        title="停止并回到开头"
      >
        ⏹
      </button>
      <input
        className="playback-controls__scrub"
        type="range"
        min={0}
        max={Math.round(durationMs)}
        step={50}
        value={Math.round(timeMs)}
        disabled={durationMs <= 0}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label="拖动时间轴预览灯光"
        style={{ ["--scrub-percent" as string]: `${percent}%` }}
      />
      <span className="playback-controls__time">
        {formatTimecode(timeMs)} / {formatTimecode(durationMs)}
      </span>
    </div>
  );
}
