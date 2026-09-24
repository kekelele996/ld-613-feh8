import { useEffect, useMemo } from "react";
import { PlaybackControls } from "../components/common/PlaybackControls";
import { StageCanvas } from "../components/common/StageCanvas";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { ActiveScenePanel } from "../components/preview/ActiveScenePanel";
import { FixtureStatePanel } from "../components/preview/FixtureStatePanel";
import { SkippedScenesPanel } from "../components/preview/SkippedScenesPanel";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { usePreviewStore } from "../stores/PreviewStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";

export function PreviewPage() {
  const fixtures = useFixtureStore((state) => state.rows);
  const scenes = useCueSceneStore((state) => state.rows);
  const tracks = useTimelineTrackStore((state) => state.rows);
  const loadingFixtures = useFixtureStore((state) => state.loading);
  const loadFixtures = useFixtureStore((state) => state.load);
  const loadScenes = useCueSceneStore((state) => state.load);
  const loadTracks = useTimelineTrackStore((state) => state.load);
  const resetLocked = usePreviewStore((state) => state.resetLocked);

  useEffect(() => {
    void loadFixtures();
    void loadScenes();
    void loadTracks();
  }, [loadFixtures, loadScenes, loadTracks]);

  const playback = useTimelinePlayback(tracks, scenes, fixtures);
  const { frame, labels } = playback;

  const skippedTrackIds = useMemo(
    () => new Set(frame.skippedTracks.map((item) => item.track.id)),
    [frame.skippedTracks]
  );

  const lockedCount = tracks.filter((track) => track.locked).length;

  return (
    <main className="page preview-page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light · rehearsal</p>
          <h1>{labels.title}</h1>
          <p className="page-hint">{labels.playbackHint}。{labels.lockedNote}。</p>
        </div>
        <div className="page-head-badges">
          <StatusBadge value={loadingFixtures ? "LOADING" : "LOCAL_DATA"} />
          <StatusBadge value={`${fixtures.length}_FIXTURES`} />
          <StatusBadge value={`${lockedCount}_LOCKED`} />
        </div>
      </section>

      <section className="panel preview-stage-panel">
        <div className="preview-stage-head">
          <h2>二维舞台</h2>
          <div className="preview-progress">
            <span className="preview-progress-label">{labels.progress}</span>
            <div className="preview-progress-bar" aria-hidden>
              <span style={{ width: `${playback.progress * 100}%` }} />
            </div>
            <strong>{Math.round(playback.progress * 100)}%</strong>
          </div>
        </div>
        <StageCanvas fixtures={frame.fixtures} />
      </section>

      <section className="panel preview-timeline-panel">
        <PlaybackControls
          timeMs={playback.timeMs}
          durationMs={playback.durationMs}
          playing={playback.playing}
          progress={playback.progress}
          onToggle={playback.toggle}
          onStop={playback.stop}
          onSeek={playback.seek}
        />
        <TimelineRuler
          tracks={tracks}
          scenes={scenes}
          timeMs={playback.timeMs}
          durationMs={playback.durationMs}
          skippedTrackIds={skippedTrackIds}
          onSeek={playback.seek}
        />
        <div className="preview-locked-actions">
          <span className="muted">{labels.lockedNote}。</span>
          <button className="text-btn" onClick={() => resetLocked(tracks, scenes)}>恢复锁定轨道现场值</button>
        </div>
      </section>

      <section className="preview-info-grid">
        <ActiveScenePanel
          activeTracks={frame.activeTracks}
          timeMs={frame.time_ms}
          durationMs={frame.duration_ms}
          noActiveText={labels.noActiveScene}
        />
        <FixtureStatePanel fixtures={frame.fixtures} />
        <SkippedScenesPanel skippedTracks={frame.skippedTracks} emptyText={labels.noSkipped} />
      </section>
    </main>
  );
}
