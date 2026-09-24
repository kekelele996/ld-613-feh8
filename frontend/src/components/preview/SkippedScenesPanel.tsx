import type { SkippedTrackInfo } from "../../types/PreviewFrame";

type Props = {
  skippedTracks: SkippedTrackInfo[];
  emptyText: string;
};

/** 跳过的场景：未就绪或无效的轨道在此说明原因（与播放进度无关，始终展示） */
export function SkippedScenesPanel({ skippedTracks, emptyText }: Props) {
  return (
    <div className="panel skipped-panel">
      <h2>跳过的场景</h2>
      <p className="panel-sub">未就绪或无效的场景不会参与合成</p>
      {skippedTracks.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <ul className="skipped-list">
          {skippedTracks.map(({ track, scene, reasons }) => (
            <li key={track.id} className="skipped-item">
              <div className="skipped-head">
                <strong>轨道 #{track.id}</strong>
                <span className="skipped-scene-name">{scene ? scene.name : `场景 #${track.cue_scene_id}`}</span>
                {track.locked && <span className="skipped-tag">锁定</span>}
              </div>
              <ul className="skipped-reasons">
                {reasons.map((reason, index) => (
                  <li key={index}>· {reason}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
