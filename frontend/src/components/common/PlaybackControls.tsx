import { formatPercent, formatTimecode } from "../../utils/formatters";

type Props = {
  timeMs: number;
  durationMs: number;
  playing: boolean;
  progress: number;
  onToggle: () => void;
  onStop: () => void;
  onSeek: (timeMs: number) => void;
};

export function PlaybackControls({ timeMs, durationMs, playing, progress, onToggle, onStop, onSeek }: Props) {
  return (
    <div className="playback-controls">
      <button className={"playback-btn" + (playing ? " is-playing" : "")} onClick={onToggle} aria-label={playing ? "暂停" : "播放"}>
        {playing ? "⏸ 暂停" : "▶ 播放"}
      </button>
      <button className="playback-btn" onClick={onStop} aria-label="停止并回到开头">⏹ 停止</button>
      <input
        className="playback-scrubber"
        type="range"
        min={0}
        max={durationMs}
        step={50}
        value={Math.min(timeMs, durationMs)}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label="播放进度"
      />
      <span className="playback-timecode" aria-label="当前时间">
        {formatTimecode(timeMs)} / {formatTimecode(durationMs)}
      </span>
      <span className="playback-percent">{formatPercent(progress)}</span>
    </div>
  );
}
