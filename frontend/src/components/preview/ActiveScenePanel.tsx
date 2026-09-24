import { formatPercent, formatTimecode } from "../../utils/formatters";
import type { ActiveTrackInfo } from "../../types/PreviewFrame";

type Props = {
  activeTracks: ActiveTrackInfo[];
  timeMs: number;
  durationMs: number;
  noActiveText: string;
};

/** 当前场景：列出当前时刻正在接管灯具的轨道，按层级/优先级排序 */
export function ActiveScenePanel({ activeTracks, timeMs, durationMs, noActiveText }: Props) {
  return (
    <div className="panel active-scene-panel">
      <h2>当前场景</h2>
      <p className="panel-sub">
        {formatTimecode(timeMs)} / {formatTimecode(durationMs)} · 共 {activeTracks.length} 条活动轨道
      </p>
      {activeTracks.length === 0 ? (
        <p className="muted">{noActiveText}</p>
      ) : (
        <ul className="active-scene-list">
          {activeTracks.map(({ track, scene, gain, locked }) => (
            <li key={track.id} className={"active-scene-item" + (locked ? " is-locked" : "")}>
              <div className="active-scene-head">
                <strong>{locked ? "🔒 " : ""}{scene.name}</strong>
                <span className="active-scene-rank">层级 {track.layer} · 优先级 {scene.priority}</span>
              </div>
              <div className="active-scene-meta">
                <span>轨道 #{track.id}</span>
                <span>{locked ? "保留现场值" : `淡入进度 ${formatPercent(gain)}`}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
