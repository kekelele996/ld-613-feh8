import { useEffect, useMemo } from "react";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import { useTimelinePlayback } from "./useTimelinePlayback";
import { buildTimelineComposition, composeFrame } from "../services/previewEngine";

/**
 * 舞台预览数据装配 hook：
 * 从各实体 store 取数 -> 预览引擎解析时间轴 -> 按播放头合成现场帧。
 * 页面组件只负责渲染，层级/优先级/锁定规则全部收敛在引擎内。
 */
export function useStagePreview() {
  const fixtures = useFixtureStore((state) => state.rows);
  const scenes = useCueSceneStore((state) => state.rows);
  const tracks = useTimelineTrackStore((state) => state.rows);
  const loadFixtures = useFixtureStore((state) => state.load);
  const loadScenes = useCueSceneStore((state) => state.load);
  const loadTracks = useTimelineTrackStore((state) => state.load);

  useEffect(() => {
    void loadFixtures();
    void loadScenes();
    void loadTracks();
  }, [loadFixtures, loadScenes, loadTracks]);

  const composition = useMemo(
    () => buildTimelineComposition(tracks, scenes),
    [tracks, scenes]
  );

  const playback = useTimelinePlayback(composition.durationMs);

  const frame = useMemo(
    () => composeFrame(fixtures, composition, playback.timeMs),
    [fixtures, composition, playback.timeMs]
  );

  return {
    fixtures,
    composition,
    skippedTracks: composition.skippedTracks,
    playback,
    frame
  };
}
