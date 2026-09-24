import { useEffect } from "react";
import { useStagePreview } from "../hooks/useStagePreview";
import { StageCanvas } from "../components/common/StageCanvas";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { PlaybackControls } from "../components/common/PlaybackControls";
import { FixtureStateList } from "../components/preview/FixtureStateList";
import { ActiveScenePanel, SkippedSceneList } from "../components/preview/SkippedSceneList";
import { formatTimecode } from "../utils/formatters";

export function PreviewPage() {
  const { fixtures, composition, skippedTracks, playback, frame } = useStagePreview();
  const { timeMs, durationMs, progress, isPlaying, toggle, stop, seek } = playback;

  // 空格键播放/暂停，避免操作员在鼠标拖动后还要去点按钮。
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.code === "Space" && target?.tagName !== "INPUT" && target?.tagName !== "BUTTON") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  const activeTrackIds = frame.activeTracks.map((track) => track.trackId);
  const progressLabel = durationMs > 0 ? `${Math.round(progress * 100)}%` : "—";

  return (
    <section className="preview-page">
      <header className="preview-header">
        <div>
          <p className="eyebrow">stage-light / playback</p>
          <h1>舞台预览</h1>
          <p className="preview-header__hint">
            在时间轴上拖动或按播放，按各轨道起止时间合成现场效果：层级高的场景优先；层级相同时优先级高的接管；
            🔒 锁定轨道保留现场值，不随播放进度变化。
          </p>
        </div>
        <dl className="preview-header__summary">
          <div>
            <dt>当前场景</dt>
            <dd>{frame.currentScene ?? "—"}</dd>
          </div>
          <div>
            <dt>播放进度</dt>
            <dd>
              {formatTimecode(timeMs)} <small>({progressLabel})</small>
            </dd>
          </div>
          <div>
            <dt>受控灯具</dt>
            <dd>
              {frame.fixtures.filter((state) => state.sourceTrackId !== null).length}/{fixtures.length}
            </dd>
          </div>
        </dl>
      </header>

      <div className="panel preview-stage-panel">
        <StageCanvas fixtures={fixtures} states={frame.fixtures} />
      </div>

      <div className="panel preview-timeline-panel">
        <PlaybackControls
          isPlaying={isPlaying}
          timeMs={timeMs}
          durationMs={durationMs}
          onToggle={toggle}
          onStop={stop}
          onSeek={seek}
        />
        {composition.validTracks.length === 0 ? (
          <p className="muted preview-timeline-panel__empty">
            没有可播放的有效轨道{skippedTracks.length > 0 ? "，请查看右侧跳过原因" : ""}。
          </p>
        ) : (
          <TimelineRuler
            durationMs={durationMs}
            timeMs={timeMs}
            tracks={composition.validTracks}
            activeTrackIds={activeTrackIds}
            onSeek={seek}
          />
        )}
      </div>

      <div className="preview-side-grid">
        <div className="panel">
          <ActiveScenePanel
            currentScene={frame.currentScene}
            activeTracks={frame.activeTracks}
            lockedTracks={frame.lockedTracks}
          />
        </div>
        <div className="panel">
          <SkippedSceneList skipped={skippedTracks} />
        </div>
      </div>

      <div className="panel">
        <FixtureStateList fixtures={fixtures} states={frame.fixtures} />
      </div>
    </section>
  );
}
