import type { CueScene } from "./CueScene";
import type { Fixture } from "./Fixture";
import type { FixtureStateValue } from "./CueScene";
import type { TimelineTrack } from "./TimelineTrack";

/** 轨道在当前时刻对单台灯具的一条候选输出 */
export interface TrackContribution {
  track: TimelineTrack;
  scene: CueScene;
  state: FixtureStateValue;
  /** 0~1，淡入进度（锁定轨道恒为 1） */
  gain: number;
  locked: boolean;
}

/** 参与合成的一条轨道（当前时刻处于激活区间） */
export interface ActiveTrackInfo {
  track: TimelineTrack;
  scene: CueScene;
  gain: number;
  locked: boolean;
}

/** 被跳过的轨道及原因（未就绪 / 无效） */
export interface SkippedTrackInfo {
  track: TimelineTrack;
  scene?: CueScene;
  reasons: string[];
}

/** 单台灯具在当前时刻合成后的现场状态 */
export interface RenderedFixture {
  fixture: Fixture;
  color: string;
  brightness: number;
  sourceScene?: CueScene;
  sourceTrack?: TimelineTrack;
  locked: boolean;
  active: boolean;
}

export interface PreviewFrame {
  time_ms: number;
  duration_ms: number;
  fixtures: RenderedFixture[];
  activeTracks: ActiveTrackInfo[];
  skippedTracks: SkippedTrackInfo[];
}
