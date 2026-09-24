import { useCallback, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { formatTimecode } from "../../utils/formatters";
import type { CueScene } from "../../types/CueScene";
import type { TimelineTrack } from "../../types/TimelineTrack";

type Props = {
  tracks?: TimelineTrack[];
  scenes?: CueScene[];
  timeMs?: number;
  durationMs?: number;
  /** 被跳过的轨道 id（未就绪/无效） */
  skippedTrackIds?: Set<number>;
  onSeek?: (timeMs: number) => void;
  /** 兼容旧占位调用 */
  title?: string;
  value?: string;
};

const TICK_COUNT = 5;

export function TimelineRuler({
  tracks = [],
  scenes = [],
  timeMs = 0,
  durationMs = 1,
  skippedTrackIds = new Set<number>(),
  onSeek,
  title,
  value
}: Props) {
  const laneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const lane = laneRef.current;
      if (!lane || !onSeek) return;
      const rect = lane.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onSeek(ratio * durationMs);
    },
    [durationMs, onSeek]
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    seekFromClientX(event.clientX);
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    seekFromClientX(event.clientX);
  };
  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  if (tracks.length === 0) {
    return (
      <div className="shared-widget">
        <strong>{title ?? "TimelineRuler"}</strong>
        {value ? <span>{value}</span> : <span>暂无轨道</span>}
      </div>
    );
  }

  const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));
  const unlocked = tracks.filter((track) => !track.locked);
  const locked = tracks.filter((track) => track.locked);
  const playheadPercent = durationMs > 0 ? (timeMs / durationMs) * 100 : 0;

  const renderClip = (track: TimelineTrack) => {
    const scene = sceneMap.get(track.cue_scene_id);
    const skipped = skippedTrackIds.has(track.id);
    const left = durationMs > 0 ? (Number(track.start_ms) / durationMs) * 100 : 0;
    const width = durationMs > 0 ? (Number(track.duration_ms) / durationMs) * 100 : 0;
    const active = timeMs >= Number(track.start_ms) && timeMs < Number(track.start_ms) + Number(track.duration_ms);
    return (
      <div
        key={track.id}
        className={
          "ruler-clip" +
          (skipped ? " is-skipped" : "") +
          (active ? " is-active" : "") +
          ` layer-${Math.max(1, Math.min(5, Number(track.layer)))}`
        }
        style={{ left: `${left}%`, width: `${Math.max(width, 0.5)}%` }}
        title={
          `${scene?.name ?? `场景 #${track.cue_scene_id}`} · 层级 ${track.layer} · 优先级 ${scene?.priority ?? "-"}\n` +
          `${formatTimecode(Number(track.start_ms))} - ${formatTimecode(Number(track.start_ms) + Number(track.duration_ms))}` +
          (skipped ? "\n已跳过（见右侧跳过说明）" : "")
        }
      >
        <span className="ruler-clip-name">{scene?.name ?? `#${track.cue_scene_id}（缺失）`}</span>
        <span className="ruler-clip-meta">L{track.layer}/P{scene?.priority ?? "-"}</span>
      </div>
    );
  };

  return (
    <div className="timeline-ruler" aria-label="时间轴">
      <div className="ruler-ticks" aria-hidden>
        {Array.from({ length: TICK_COUNT + 1 }, (_, index) => (
          <span key={index} style={{ left: `${(index / TICK_COUNT) * 100}%` }}>
            {formatTimecode((durationMs * index) / TICK_COUNT)}
          </span>
        ))}
      </div>
      <div
        ref={laneRef}
        className={"ruler-lane" + (onSeek ? " is-draggable" : "")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="ruler-layer-label">解锁轨道</div>
        {unlocked.map(renderClip)}
        <div className="ruler-playhead" style={{ left: `${playheadPercent}%` }}>
          <span className="ruler-playhead-grip" />
        </div>
      </div>
      {locked.length > 0 && (
        <div className="ruler-locked-lane">
          <div className="ruler-layer-label">锁定轨道</div>
          {locked.map((track) => {
            const scene = sceneMap.get(track.cue_scene_id);
            const skipped = skippedTrackIds.has(track.id);
            return (
              <div key={track.id} className={"ruler-locked-chip" + (skipped ? " is-skipped" : "")} title={scene?.name}>
                🔒 {scene?.name ?? `场景 #${track.cue_scene_id}`} · 层级 {track.layer}（现场值）
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
