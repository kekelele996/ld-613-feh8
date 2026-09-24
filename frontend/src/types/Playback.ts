// 舞台预览合成相关的运行时类型。
// 持久化模型（Fixture / CueScene / TimelineTrack）的字段仍按字符串存储，
// 这些类型描述“按某一时刻”合成出来的现场效果。

/** 单盏灯在某一场景中的目标状态，通道取值 0-255。 */
export interface FixtureState {
  /** 0-255，红色通道 */
  r: number;
  /** 0-255，绿色通道 */
  g: number;
  /** 0-255，蓝色通道 */
  b: number;
  /** 0-100，调光亮度百分比 */
  brightness: number;
}

/** 合成后某一盏灯在播放头位置的现场状态。 */
export interface CompositeFixtureState extends FixtureState {
  fixtureId: number;
  /** 实际接管该灯的场景名称，未被任何场景控制时为 null */
  sourceScene: string | null;
  /** 实际接管该灯的轨道 id，便于在列表中标注来源 */
  sourceTrackId: number | null;
  /** 0-1，当前淡入进度，已完成保持阶段为 1 */
  fadeProgress: number;
  /** 该值来自锁定轨道的现场值，播放过程中保持不变 */
  locked: boolean;
}

/** 跳过轨道/场景的原因分类，展示组件依赖该枚举渲染徽标。 */
export type SkipReasonCode =
  | "SCENE_NOT_FOUND"
  | "SCENE_NOT_READY"
  | "INVALID_TIME_RANGE"
  | "INVALID_FIXTURE_STATES"
  | "EMPTY_FIXTURE_STATES";

export interface SkippedTrack {
  trackId: number;
  sceneId: number | null;
  sceneName: string | null;
  reasonCode: SkipReasonCode;
  reason: string;
}

/** 轨道解析后的场景视图，供合成引擎与时间轴展示共用。 */
export interface ResolvedTrack {
  trackId: number;
  sceneId: number;
  sceneName: string;
  sceneStatus: string;
  startMs: number;
  durationMs: number;
  endMs: number;
  layer: number;
  priority: number;
  fadeInMs: number;
  locked: boolean;
  /** fixtureId -> 场景目标状态 */
  states: Record<number, FixtureState>;
}

/** 播放头某一时刻的整帧合成结果。 */
export interface CompositeFrame {
  timeMs: number;
  /** 每盏灯的现场状态，按 store 中灯具顺序排列 */
  fixtures: CompositeFixtureState[];
  /** 当前时刻实际处于区间内（参与合成）的轨道，按层级、优先级排序 */
  activeTracks: ResolvedTrack[];
  /** 全场始终生效的锁定轨道 */
  lockedTracks: ResolvedTrack[];
  /** 当前时间轴上处于主导地位的场景名称（层级最高者） */
  currentScene: string | null;
}

/** 时间轴整体解析结果，含无效轨道说明。 */
export interface TimelineComposition {
  validTracks: ResolvedTrack[];
  skippedTracks: SkippedTrack[];
  durationMs: number;
}
