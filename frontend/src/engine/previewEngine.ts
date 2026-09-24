import type { CueScene, FixtureStateValue } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { TimelineTrack } from "../types/TimelineTrack";
import type {
  ActiveTrackInfo,
  PreviewFrame,
  RenderedFixture,
  SkippedTrackInfo,
  TrackContribution
} from "../types/PreviewFrame";
import { PREVIEW_SKIP_REASONS } from "../constants/previewMessages";

const READY_STATUS = "READY";
const HEX_6 = /^#[0-9a-fA-F]{6}$/;
const HEX_3 = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
const DIMMER_ONLY = "DIMMER_ONLY";

/** 把 #rgb 规范化为 #rrggbb；非法颜色返回 null */
export function normalizeHexColor(color: string): string | null {
  if (HEX_6.test(color)) return color.toLowerCase();
  const matched = HEX_3.exec(color);
  if (matched) {
    return `#${matched[1]}${matched[1]}${matched[2]}${matched[2]}${matched[3]}${matched[3]}`.toLowerCase();
  }
  return null;
}

function isFiniteBrightness(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

/**
 * 校验一个场景能否参与预览。
 * 返回原因列表；为空数组表示场景有效。
 */
export function validateSceneStates(scene: CueScene | undefined, fixtureMap: Map<number, Fixture>): string[] {
  const reasons: string[] = [];
  if (!scene) {
    reasons.push(PREVIEW_SKIP_REASONS.SCENE_NOT_FOUND);
    return reasons;
  }
  if (scene.scene_status !== READY_STATUS) {
    reasons.push(PREVIEW_SKIP_REASONS.STATUS_NOT_READY(scene.scene_status));
  }
  if (!Array.isArray(scene.fixture_states) || scene.fixture_states.length === 0) {
    reasons.push(PREVIEW_SKIP_REASONS.STATES_EMPTY);
    return reasons;
  }
  scene.fixture_states.forEach((state) => {
    const fixture = fixtureMap.get(state.fixture_id);
    if (!fixture) {
      reasons.push(PREVIEW_SKIP_REASONS.FIXTURE_NOT_FOUND(state.fixture_id));
      return;
    }
    if (normalizeHexColor(String(state.color ?? "")) === null) {
      // 纯调光灯具允许缺省颜色，渲染时按白光处理
      if (!(fixture.color_mode === DIMMER_ONLY && !state.color)) {
        reasons.push(PREVIEW_SKIP_REASONS.COLOR_INVALID(state.fixture_id, String(state.color ?? "")));
      }
    }
    if (!isFiniteBrightness(state.brightness)) {
      reasons.push(PREVIEW_SKIP_REASONS.BRIGHTNESS_INVALID(state.fixture_id, state.brightness));
    }
  });
  return reasons;
}

/** 时间轴总时长：所有解锁轨道结束时刻的最大值 */
export function getTimelineDuration(tracks: TimelineTrack[]): number {
  const end = tracks.reduce((max, track) => {
    if (track.locked) return max;
    const value = Number(track.start_ms) + Number(track.duration_ms);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
  return end > 0 ? end : 1;
}

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** 同灯具多场景仲裁：层级高者优先；层级相同场景优先级高者接管；再相同则 id 小的稳定靠前 */
function isStronger(candidate: TrackContribution, current: TrackContribution): boolean {
  if (candidate.track.layer !== current.track.layer) {
    return candidate.track.layer > current.track.layer;
  }
  if (candidate.scene.priority !== current.scene.priority) {
    return candidate.scene.priority > current.scene.priority;
  }
  return candidate.track.id < current.track.id;
}

function resolveStateColor(state: FixtureStateValue, fixture: Fixture): string {
  const normalized = normalizeHexColor(String(state.color ?? ""));
  if (normalized) return normalized;
  return fixture.color_mode === DIMMER_ONLY ? "#ffffff" : "#000000";
}

/**
 * 按播放时刻合成现场效果。
 * @param timeMs       当前播放进度（毫秒）
 * @param lockedLive   锁定轨道的现场值（trackId -> states），不随 timeMs 变化
 */
export function composePreviewFrame(
  timeMs: number,
  tracks: TimelineTrack[],
  scenes: CueScene[],
  fixtures: Fixture[],
  lockedLive: Map<number, FixtureStateValue[]> = new Map()
): PreviewFrame {
  const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));
  const fixtureMap = new Map(fixtures.map((fixture) => [fixture.id, fixture]));

  const skippedTracks: SkippedTrackInfo[] = [];
  const winners = new Map<number, TrackContribution>();
  const winningTracks = new Map<number, TrackContribution>();

  tracks.forEach((track) => {
    const scene = sceneMap.get(track.cue_scene_id);
    const reasons = validateSceneStates(scene, fixtureMap);

    if (track.locked) {
      if (reasons.length > 0) {
        skippedTracks.push({ track, scene, reasons });
        return;
      }
      const liveStates = lockedLive.get(track.id) ?? scene!.fixture_states;
      liveStates.forEach((state) => {
        const fixture = fixtureMap.get(state.fixture_id);
        if (!fixture) return;
        const contribution: TrackContribution = { track, scene: scene!, state, gain: 1, locked: true };
        const existing = winners.get(state.fixture_id);
        if (!existing || isStronger(contribution, existing)) {
          winners.set(state.fixture_id, contribution);
          winningTracks.set(track.id, contribution);
        }
      });
      return;
    }

    const duration = Number(track.duration_ms);
    if (!Number.isFinite(duration) || duration <= 0) {
      reasons.push(PREVIEW_SKIP_REASONS.DURATION_INVALID);
    }
    if (reasons.length > 0) {
      skippedTracks.push({ track, scene, reasons });
      return;
    }

    const start = Number(track.start_ms);
    const end = start + duration;
    if (timeMs < start || timeMs >= end) return;

    const fadeIn = Number(scene!.fade_in_ms);
    const gain = fadeIn > 0 ? clamp01((timeMs - start) / fadeIn) : 1;

    scene!.fixture_states.forEach((state) => {
      if (!fixtureMap.has(state.fixture_id)) return;
      const contribution: TrackContribution = { track, scene: scene!, state, gain, locked: false };
      const existing = winners.get(state.fixture_id);
      if (!existing || isStronger(contribution, existing)) {
        winners.set(state.fixture_id, contribution);
        winningTracks.set(track.id, contribution);
      }
    });
  });

  const renderedFixtures: RenderedFixture[] = fixtures.map((fixture) => {
    const winner = winners.get(fixture.id);
    if (!winner) {
      return { fixture, color: "#000000", brightness: 0, locked: false, active: false };
    }
    return {
      fixture,
      color: resolveStateColor(winner.state, fixture),
      brightness: Math.round(winner.state.brightness * winner.gain),
      sourceScene: winner.scene,
      sourceTrack: winner.track,
      locked: winner.locked,
      active: true
    };
  });

  const activeTracks: ActiveTrackInfo[] = [...winningTracks.values()]
    .sort((a, b) => b.track.layer - a.track.layer || b.scene.priority - a.scene.priority || a.track.id - b.track.id)
    .map(({ track, scene, gain, locked }) => ({ track, scene, gain, locked }));

  skippedTracks.sort((a, b) => a.track.id - b.track.id);

  return {
    time_ms: Math.max(0, timeMs),
    duration_ms: getTimelineDuration(tracks),
    fixtures: renderedFixtures,
    activeTracks,
    skippedTracks
  };
}
