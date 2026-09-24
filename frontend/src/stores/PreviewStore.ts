import { create } from "zustand";
import type { CueScene, FixtureStateValue } from "../types/CueScene";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  /** trackId -> 现场灯具状态（锁定轨道专用，不随播放进度变化） */
  lockedLive: Map<number, FixtureStateValue[]>;
  /** 首次遇到锁定轨道时用场景状态播种 */
  seedLocked: (tracks: TimelineTrack[], scenes: CueScene[]) => void;
  /** 操作员手动调整某条锁定轨道上某盏灯的现场亮度 */
  setLockedBrightness: (trackId: number, fixtureId: number, brightness: number) => void;
  /** 恢复为场景内的初始现场值 */
  resetLocked: (tracks: TimelineTrack[], scenes: CueScene[]) => void;
};

const clampBrightness = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const usePreviewStore = create<State>((set, get) => ({
  lockedLive: new Map(),

  seedLocked(tracks, scenes) {
    const next = new Map(get().lockedLive);
    const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));
    tracks.forEach((track) => {
      if (!track.locked || next.has(track.id)) return;
      const scene = sceneMap.get(track.cue_scene_id);
      if (scene) {
        next.set(track.id, scene.fixture_states.map((state) => ({ ...state })));
      }
    });
    set({ lockedLive: next });
  },

  setLockedBrightness(trackId, fixtureId, brightness) {
    const current = get().lockedLive;
    const states = current.get(trackId);
    if (!states) return;
    const nextStates = states.map((state) =>
      state.fixture_id === fixtureId ? { ...state, brightness: clampBrightness(brightness) } : state
    );
    const next = new Map(current);
    next.set(trackId, nextStates);
    set({ lockedLive: next });
  },

  resetLocked(tracks, scenes) {
    const next = new Map<number, FixtureStateValue[]>();
    const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));
    tracks.forEach((track) => {
      if (!track.locked) return;
      const scene = sceneMap.get(track.cue_scene_id);
      if (scene) next.set(track.id, scene.fixture_states.map((state) => ({ ...state })));
    });
    set({ lockedLive: next });
  }
}));
