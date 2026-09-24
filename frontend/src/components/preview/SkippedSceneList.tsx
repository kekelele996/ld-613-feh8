import type { ResolvedTrack, SkippedTrack } from "../../types/Playback";
import { formatTimecode } from "../../utils/formatters";

export interface SkippedSceneListProps {
  skipped: SkippedTrack[];
}

/** 未就绪/无效场景跳过说明：轨道、场景名与原因并排展示，方便操作员现场核对。 */
export function SkippedSceneList({ skipped }: SkippedSceneListProps) {
  return (
    <div className="skipped-scene-list">
      <h3>
        跳过的场景
        <span className="skipped-scene-list__count">{skipped.length}</span>
      </h3>
      {skipped.length === 0 ? (
        <p className="muted">所有轨道均通过校验，没有场景被跳过。</p>
      ) : (
        <ul>
          {skipped.map((item) => (
            <li key={item.trackId}>
              <div className="skipped-scene-list__head">
                <span className="skipped-scene-list__track">轨道 #{item.trackId}</span>
                <strong>{item.sceneName ?? `场景 #${item.sceneId ?? "?"}`}</strong>
              </div>
              <span className={`skip-badge skip-badge--${item.reasonCode.toLowerCase()}`}>
                {item.reasonCode}
              </span>
              <p>{item.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface ActiveScenePanelProps {
  currentScene: string | null;
  activeTracks: ResolvedTrack[];
  lockedTracks: ResolvedTrack[];
}

/** 当前场景概览：主场景、区间内场景层级、锁定轨道（全程不随进度变化）。 */
export function ActiveScenePanel({ currentScene, activeTracks, lockedTracks }: ActiveScenePanelProps) {
  return (
    <div className="active-scene-panel">
      <div className="active-scene-panel__current">
        <span className="muted">当前场景</span>
        <strong>{currentScene ?? "—（无场景处于播放区间）"}</strong>
      </div>
      <div className="active-scene-panel__groups">
        <div>
          <span className="muted">区间内生效（{activeTracks.length}）</span>
          {activeTracks.length === 0 ? (
            <p className="active-scene-panel__empty">播放头未落在任何非锁定轨道上</p>
          ) : (
            <ol>
              {activeTracks.map((track) => (
                <li key={track.trackId}>
                  {track.sceneName}
                  <em>
                    层级 {track.layer} · 优先级 {track.priority} ·{" "}
                    {formatTimecode(track.startMs)}–{formatTimecode(track.endMs)}
                  </em>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <span className="muted">锁定轨道（{lockedTracks.length}）</span>
          {lockedTracks.length === 0 ? (
            <p className="active-scene-panel__empty">无锁定轨道</p>
          ) : (
            <ol>
              {lockedTracks.map((track) => (
                <li key={track.trackId} className="is-locked">
                  🔒 {track.sceneName}
                  <em>保留现场值，不随播放进度变化 · 层级 {track.layer}</em>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
