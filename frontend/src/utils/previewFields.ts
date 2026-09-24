import type { FixtureState } from "../types/Playback";

/** 解析持久化的数字字符串；空串、非数字、NaN 返回 null。 */
export const parseNumericField = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** 解析非负数字字段，负数视为无效。 */
export const parseNonNegativeField = (value: unknown): number | null => {
  const parsed = parseNumericField(value);
  return parsed !== null && parsed >= 0 ? parsed : null;
};

/** 锁定字段在 IndexedDB 中以 "true"/"false"/"1" 等字符串保存。 */
export const parseBooleanField = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  return String(value).trim().toLowerCase() === "true" || String(value).trim() === "1";
};

const clampChannel = (value: number): number => Math.min(255, Math.max(0, value));
const clampBrightness = (value: number): number => Math.min(100, Math.max(0, value));

/**
 * 解析单盏灯的通道状态。允许字段缺失：
 * RGB 缺省 0，亮度缺省 100；出现非数字通道则整体无效。
 */
export const parseFixtureState = (raw: unknown): FixtureState | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const entry = raw as Record<string, unknown>;
  const r = parseNumericField(entry.r);
  const g = parseNumericField(entry.g);
  const b = parseNumericField(entry.b);
  const brightness = parseNumericField(entry.brightness);
  if (r === null || g === null || b === null || brightness === null) return null;
  return {
    r: clampChannel(r),
    g: clampChannel(g),
    b: clampChannel(b),
    brightness: clampBrightness(brightness)
  };
};

export interface ParsedFixtureStates {
  states: Record<number, FixtureState>;
  /** 无法解析或灯具编号非法的条目，供调用方决定是否整条跳过 */
  invalidEntryCount: number;
}

/**
 * 解析 CueScene.fixture_states。
 * 持久化形态为 JSON 字符串：{ "<fixtureId>": { r,g,b,brightity } }。
 */
export const parseFixtureStates = (raw: unknown): ParsedFixtureStates | null => {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (text === "") return null;
    try {
      parsed = JSON.parse(text);
    } catch {
      return null;
    }
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

  const states: Record<number, FixtureState> = {};
  let invalidEntryCount = 0;
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    const fixtureId = parseNumericField(key);
    const state = parseFixtureState(value);
    if (fixtureId === null || !Number.isInteger(fixtureId) || fixtureId <= 0 || state === null) {
      invalidEntryCount += 1;
      continue;
    }
    states[fixtureId] = state;
  }
  return { states, invalidEntryCount };
};

/** 灯具平面坐标：数值字符串 -> 0-100 的百分比坐标；非法时由调用方走自动网格兜底。 */
export const parsePositionField = (value: unknown): number | null => {
  const parsed = parseNumericField(value);
  return parsed !== null ? Math.min(100, Math.max(0, parsed)) : null;
};
