import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PREVIEW_LABELS } from "../constants/previewMessages";
import { composePreviewFrame, getTimelineDuration } from "../engine/previewEngine";
import { usePreviewStore } from "../stores/PreviewStore";
import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { PreviewFrame } from "../types/PreviewFrame";
import type { TimelineTrack } from "../types/TimelineTrack";

/**
 * 时间轴播放：支持拖动 seek、播放/暂停/停止，按当前时刻合成预览帧。
 * 锁定轨道的现场值来自 PreviewStore，播放推进不会修改它们。
 */
export function useTimelinePlayback(tracks: TimelineTrack[], scenes: CueScene[], fixtures: Fixture[]) {
  const duration = useMemo(() => getTimelineDuration(tracks), [tracks]);
  const [timeMs, setTimeMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number>();
  const startedAtRef = useRef<number>(0);
  const baseTimeRef = useRef<number>(0);
  const lockedLive = usePreviewStore((state) => state.lockedLive);
  const seedLocked = usePreviewStore((state) => state.seedLocked);

  useEffect(() => {
    seedLocked(tracks, scenes);
  }, [tracks, scenes, seedLocked]);

  // 时间轴总时长变化（数据加载/编辑）后，把进度夹回合法范围
  useEffect(() => {
    setTimeMs((value) => Math.min(value, duration));
  }, [duration]);

  const seek = useCallback((next: number) => {
    setTimeMs(Math.max(0, Math.min(duration, next)));
  }, [duration]);

  const stop = useCallback(() => {
    setPlaying(false);
    setTimeMs(0);
  }, []);

  useEffect(() => {
    if (!playing) return;
    startedAtRef.current = performance.now();
    baseTimeRef.current = Math.min(timeMs, duration);

    const tick = (now: number) => {
      const elapsed = now - startedAtRef.current;
      const next = baseTimeRef.current + elapsed;
      if (next >= duration) {
        setTimeMs(duration);
        setPlaying(false);
        return;
      }
      setTimeMs(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // 仅在 playing/duration 变化时重建循环；timeMs 变化走 rAF 内部更新
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, duration]);

  const frame: PreviewFrame = useMemo(
    () => composePreviewFrame(timeMs, tracks, scenes, fixtures, lockedLive),
    [timeMs, tracks, scenes, fixtures, lockedLive]
  );

  return {
    labels: PREVIEW_LABELS,
    timeMs,
    durationMs: duration,
    playing,
    frame,
    play: () => {
      if (timeMs >= duration) setTimeMs(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    toggle: () => {
      if (!playing && timeMs >= duration) setTimeMs(0);
      setPlaying((value) => !value);
    },
    seek,
    stop,
    progress: duration > 0 ? Math.min(1, timeMs / duration) : 0
  };
}
