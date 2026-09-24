import type { FixtureStateValue } from "./CueScene";

export interface TimelineTrack {
  id: number;
  cue_scene_id: number;
  start_ms: number;
  duration_ms: number;
  layer: number;
  locked: boolean;
  /** 锁定轨道的现场值：初始化自场景，之后不随播放进度变化 */
  live_states?: FixtureStateValue[];
}
