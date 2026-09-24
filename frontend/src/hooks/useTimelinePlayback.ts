import { useCallback, useEffect, useRef, useState } from "react";

export interface TimelinePlayback {
  /** 当前播放头位置（毫秒） */
  timeMs: number;
  isPlaying: boolean;
  /** 0-1，进度条与标尺共用 */
  progress: number;
  durationMs: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  /** 时间轴拖动：直接跳转到指定毫秒（自动夹取到合法范围） */
  seek: (ms: number) => void;
}

/**
 * 时间轴播放 hook：requestAnimationFrame 驱动，
 * 拖到结尾自动停止并回到可重播状态。播放速度与真实毫秒一致，
 * 切标签页时 rAF 自动暂停，回来后按墙上时钟补差，不会跳帧。
 */
export function useTimelinePlayback(durationMs: number): TimelinePlayback {
  const safeDuration = Math.max(0, durationMs);
  const [timeMs, setTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const seek = useCallback(
    (ms: number) => {
      const clamped = Math.min(safeDuration, Math.max(0, ms));
      setTimeMs(clamped);
    },
    [safeDuration]
  );

  const play = useCallback(() => {
    if (safeDuration === 0) return;
    setTimeMs((current) => (current >= safeDuration ? 0 : current));
    setIsPlaying(true);
  }, [safeDuration]);

  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => {
    setIsPlaying((current) => {
      if (current) return false;
      if (safeDuration === 0) return false;
      setTimeMs((at) => (at >= safeDuration ? 0 : at));
      return true;
    });
  }, [safeDuration]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setTimeMs(0);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      lastTickRef.current = null;
      return;
    }
    const tick = (now: number) => {
      const last = lastTickRef.current ?? now;
      lastTickRef.current = now;
      setTimeMs((current) => {
        const next = current + (now - last);
        if (next >= safeDuration) {
          setIsPlaying(false);
          return safeDuration;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = null;
    };
  }, [isPlaying, safeDuration]);

  // 时间轴数据变化（如轨道被删除导致总长缩短）时夹取播放头。
  useEffect(() => {
    setTimeMs((current) => Math.min(current, safeDuration));
  }, [safeDuration]);

  return {
    timeMs,
    isPlaying,
    progress: safeDuration === 0 ? 0 : timeMs / safeDuration,
    durationMs: safeDuration,
    play,
    pause,
    toggle,
    stop,
    seek
  };
}
