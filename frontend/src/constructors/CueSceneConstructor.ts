import type { CueScene } from "../types/CueScene";

export const createDefaultCueScene = (overrides: Partial<CueScene> = {}): CueScene => ({
  id: 0,
  name: "未命名场景",
  fixture_states: [],
  fade_in_ms: 500,
  hold_ms: 2000,
  priority: 5,
  scene_status: "DRAFT",
  ...overrides
});

export const createCueSceneForm = createDefaultCueScene;
export const createCueSceneResponse = createDefaultCueScene;
