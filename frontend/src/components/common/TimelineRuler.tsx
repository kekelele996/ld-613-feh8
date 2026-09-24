import { useCallback, useRef } from "react";
import type { ResolvedTrack } from "../../types/Playback";
import { formatTimecode } from "../../utils/formatters";

export interface TimelineRulerProps {
  durationMs: number;
  timeMs: number;
  tracks: ResolvedTrack[];
  activeTrackIds?: number[];
  onSeek: (ms: number) => void;
}

const LANE_HEIGHT = 30;
const LANE_GAP = 6;
const RULER_HEIGHT = 34;

/** 按轨道区间贪心分泳道，避免同层重叠时块互相盖住。 */
const assignLanes = (tracks: ResolvedTrack[]): Map<number, number> => {
  const laneEnds: number[] = [];
  const laneById = new Map<number, number>();
  const ordered = [...tracks].sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs || a.trackId - b.trackId);
  for (const track of ordered) {
    let lane = laneEnds.findIndex((end) => end <= track.startMs);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(track.endMs);
    } else {
      laneEnds[lane] = track.endMs;
    }
    laneById.set(track.trackId, lane);
  }
  return laneById;
};

/**
 * 时间轴标尺：顶部时间刻度 + 各轨道区间块 + 可拖动播放头。
 * 锁定轨道单列在顶部“现场值”轨道带；普通轨道按区间自动分泳道。
 * 鼠标/触摸按下并拖动即 seek，松开前持续派发 onSeek。
 */
export function TimelineRuler({ durationMs, timeMs, tracks, activeTrackIds = [], onSeek }: TimelineRulerProps) {
  const trackAreaRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const ratio = (ms: number) => (durationMs > 0 ? (ms / durationMs) * 100 : 0);
  const percent = ratio(timeMs);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const el = trackAreaRef.current;
      if (!el || durationMs <= 0) return;
      const rect = el.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(pct * durationMs);
    },
    [durationMs, onSeek]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromClientX(event.clientX);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) seekFromClientX(event.clientX);
  };
  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const lockedTracks = tracks.filter((track) => track.locked);
  const unlockedTracks = tracks.filter((track) => !track.locked);
  const laneById = assignLanes(unlockedTracks);
  const laneCount = new Set(laneById.values()).size;
  const ticks = durationMs > 0 ? Array.from({ length: 6 }, (_, i) => Math.round((durationMs / 5) * i)) : [];

  return (
    <div className="timeline-ruler">
      <div className="timeline-ruler__scale" style={{ height: RULER_HEIGHT }}>
        {ticks.map((tick, i) => (
          <span key={i} className="timeline-ruler__tick" style={{ left: `${(i / 5) * 100}%` }}>
            {formatTimecode(tick)}
          </span>
        ))}
      </div>

      <div
        ref={trackAreaRef}
        className="timeline-ruler__area"
        style={{
          height:
            RULER_HEIGHT +
            (lockedTracks.length > 0 ? LANE_HEIGHT + LANE_GAP : 0) +
            Math.max(1, laneCount) * (LANE_HEIGHT + LANE_GAP)
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="slider"
        aria-label="时间轴播放头，拖动以预览不同时刻的灯光"
        aria-valuemin={0}
        aria-valuemax={Math.round(durationMs)}
        aria-valuenow={Math.round(timeMs)}
        aria-valuetext={formatTimecode(timeMs)}
        tabIndex={0}
      >
        {lockedTracks.map((track) => (
          <div
            key={track.trackId}
            className="timeline-block timeline-block--locked"
            style={{ top: 0, height: LANE_HEIGHT, left: "0.5%", right: "0.5%", width: "auto" }}
            title={`锁定轨道 #${track.trackId} · ${track.sceneName} · 全程保持现场值（层级 ${track.layer}，优先级 ${track.priority}）`}
          >
            🔒 {track.sceneName}
          </div>
        ))}

        {unlockedTracks.map((track) => {
          const lane = laneById.get(track.trackId) ?? 0;
          const laneOffset = lockedTracks.length > 0 ? LANE_HEIGHT + LANE_GAP : 0;
          const isActive = activeTrackIds.includes(track.trackId);
          return (
            <div
              key={track.trackId}
              className={`timeline-block${isActive ? " timeline-block--active" : ""}`}
              style={{
                left: `${ratio(track.startMs)}%`,
                width: `${Math.max(0.6, ratio(track.durationMs))}%`,
                top: RULER_HEIGHT + laneOffset + lane * (LANE_HEIGHT + LANE_GAP),
                height: LANE_HEIGHT
              }}
              title={`轨道 #${track.trackId} · ${track.sceneName} · ${formatTimecode(track.startMs)}-${formatTimecode(track.endMs)} · 层级 ${track.layer} · 优先级 ${track.priority}${track.fadeInMs > 0 ? ` · 淡入 ${track.fadeInMs}ms` : ""}`}
            >
              <span className="timeline-block__layer">L{track.layer}</span>
              {track.sceneName}
            </div>
          );
        })}

        <div className="timeline-ruler__playhead" style={{ left: `${percent}%` }}>
          <span className="timeline-ruler__playhead-time">{formatTimecode(timeMs)}</span>
        </div>
      </div>
    </div>
  );
}
