import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { TimelineTrack } from "../types/TimelineTrack";
import { CueStatus } from "../constants/CueStatus";
import { SkipReasonText } from "../constants/SkipReason";
import type {
  CompositeFixtureState,
  CompositeFrame,
  FixtureState,
  ResolvedTrack,
  SkippedTrack,
  TimelineComposition
} from "../types/Playback";
import {
  parseBooleanField,
  parseFixtureStates,
  parseNonNegativeField
} from "../utils/previewFields";

const OFF_STATE: FixtureState = { r: 0, g: 0, b: 0, brightness: 0 };

/**
 * 轨道接管排序：锁定轨道保留现场值，永远最先接管；
 * 否则层级（layer）高的场景优先；层级相同时优先级（priority）高的接管；
 * 再相同时先开始的轨道、再按轨道 id 兜底，保证合成结果稳定可预期。
 */
export const compareTrackControl = (a: ResolvedTrack, b: ResolvedTrack): number => {
  if (a.locked !== b.locked) return a.locked ? -1 : 1;
  if (a.layer !== b.layer) return b.layer - a.layer;
  if (a.priority !== b.priority) return b.priority - a.priority;
  if (a.startMs !== b.startMs) return a.startMs - b.startMs;
  return a.trackId - b.trackId;
};

const isTrackActiveAt = (track: ResolvedTrack, timeMs: number): boolean =>
  timeMs >= track.startMs && timeMs <= track.endMs;

/** 计算轨道在某时刻的淡入进度，0-1；超出区间由调用方保证。 */
const fadeProgressAt = (track: ResolvedTrack, timeMs: number): number => {
  if (track.locked || track.fadeInMs <= 0) return 1;
  const elapsed = timeMs - track.startMs;
  if (elapsed >= track.fadeInMs) return 1;
  return Math.min(1, Math.max(0, elapsed / track.fadeInMs));
};

const applyFade = (target: FixtureState, progress: number): FixtureState => ({
  r: Math.round(target.r * progress),
  g: Math.round(target.g * progress),
  b: Math.round(target.b * progress),
  brightness: Math.round(target.brightness * progress * 10) / 10
});

/**
 * 解析整条时间轴：跳过未就绪/无效场景并记录原因，
 * 计算时间轴总时长。锁定轨道同样要求场景有效，只是播放期间保持现场值。
 */
export const buildTimelineComposition = (
  tracks: TimelineTrack[],
  scenes: CueScene[]
): TimelineComposition => {
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  const validTracks: ResolvedTrack[] = [];
  const skippedTracks: SkippedTrack[] = [];

  const skip = (
    track: TimelineTrack,
    scene: CueScene | undefined,
    reasonCode: SkippedTrack["reasonCode"]
  ) => {
    skippedTracks.push({
      trackId: track.id,
      sceneId: scene?.id ?? track.cue_scene_id,
      sceneName: scene?.name ?? null,
      reasonCode,
      reason: SkipReasonText[reasonCode]
    });
  };

  for (const track of tracks) {
    const scene = sceneById.get(track.cue_scene_id);
    if (!scene) {
      skip(track, scene, "SCENE_NOT_FOUND");
      continue;
    }
    if (scene.scene_status !== CueStatus[1]) {
      // CueStatus 顺序为 DRAFT / READY / DISABLED / ARCHIVED，READY 才允许排练。
      skip(track, scene, "SCENE_NOT_READY");
      continue;
    }

    const startMs = parseNonNegativeField(track.start_ms);
    const durationMs = parseNonNegativeField(track.duration_ms);
    if (startMs === null || durationMs === null) {
      skip(track, scene, "INVALID_TIME_RANGE");
      continue;
    }

    const parsedStates = parseFixtureStates(scene.fixture_states);
    if (parsedStates === null) {
      skip(track, scene, "INVALID_FIXTURE_STATES");
      continue;
    }
    const validFixtureIds = Object.keys(parsedStates.states);
    if (validFixtureIds.length === 0) {
      skip(track, scene, parsedStates.invalidEntryCount > 0 ? "INVALID_FIXTURE_STATES" : "EMPTY_FIXTURE_STATES");
      continue;
    }

    const layer = parseNonNegativeField(track.layer) ?? 0;
    const priority = parseNonNegativeField(scene.priority) ?? 0;
    const fadeInMs = parseNonNegativeField(scene.fade_in_ms) ?? 0;
    validTracks.push({
      trackId: track.id,
      sceneId: scene.id,
      sceneName: scene.name,
      sceneStatus: scene.scene_status,
      startMs,
      durationMs,
      endMs: startMs + durationMs,
      layer,
      priority,
      fadeInMs,
      locked: parseBooleanField(track.locked),
      states: parsedStates.states
    });
  }

  const durationMs = validTracks.reduce((max, track) => Math.max(max, track.endMs), 0);
  return { validTracks, skippedTracks, durationMs };
};

/**
 * 按播放头时刻合成一帧现场效果。
 * - 非锁定轨道仅在 [start, end] 区间内生效，并按 fade_in_ms 线性淡入；
 * - 锁定轨道全程生效且值不随播放进度变化；
 * - 同一灯具被多个场景控制时按 compareTrackControl 决定接管者；
 * - 未被任何场景控制的灯具保持熄灭。
 */
export const composeFrame = (
  fixtures: Fixture[],
  composition: TimelineComposition,
  timeMs: number
): CompositeFrame => {
  const activeTracks = composition.validTracks
    .filter((track) => !track.locked && isTrackActiveAt(track, timeMs))
    .sort(compareTrackControl);
  const lockedTracks = composition.validTracks
    .filter((track) => track.locked)
    .sort(compareTrackControl);

  // 接管顺序：锁定轨道现场值最优先，之后才是当前区间内的场景。
  const controlOrder = [...lockedTracks, ...activeTracks];

  const compositeFixtures: CompositeFixtureState[] = fixtures.map((fixture) => {
    let winner: ResolvedTrack | null = null;
    for (const track of controlOrder) {
      if (track.states[fixture.id]) {
        winner = track;
        break;
      }
    }

    if (!winner) {
      return {
        fixtureId: fixture.id,
        ...OFF_STATE,
        sourceScene: null,
        sourceTrackId: null,
        fadeProgress: 0,
        locked: false
      };
    }

    const target = winner.states[fixture.id];
    const fadeProgress = winner.locked ? 1 : fadeProgressAt(winner, timeMs);
    return {
      fixtureId: fixture.id,
      ...applyFade(target, fadeProgress),
      sourceScene: winner.sceneName,
      sourceTrackId: winner.trackId,
      fadeProgress,
      locked: winner.locked
    };
  });

  // 当前场景：取实际接管灯具的轨道中接管顺序最靠前的一条，
  // 这样锁定轨道压住全场时操作员能看到“现场值保持中”。
  const sourceTrackIds = new Set(
    compositeFixtures
      .filter((state) => state.sourceTrackId !== null)
      .map((state) => state.sourceTrackId as number)
  );
  const currentTrack =
    controlOrder.find((track) => sourceTrackIds.has(track.trackId)) ?? null;

  return {
    timeMs,
    fixtures: compositeFixtures,
    activeTracks,
    lockedTracks,
    currentScene: currentTrack ? currentTrack.sceneName : null
  };
};

export type { CompositeFixtureState };
