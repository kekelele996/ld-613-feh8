import type { SkipReasonCode } from "../types/Playback";

/**
 * 无效/未就绪轨道的跳过原因文案。
 * 合成引擎只产出 reasonCode，页面与徽标统一在此取文案，
 * 新增原因时必须同步：types/Playback、service/previewEngine、本文件、展示组件。
 */
export const SkipReasonText: Record<SkipReasonCode, string> = {
  SCENE_NOT_FOUND: "场景不存在，轨道引用已失效",
  SCENE_NOT_READY: "场景状态不是 READY，排练时不参与播放",
  INVALID_TIME_RANGE: "起止时间无效（开始时间或持续时间不是非负数字）",
  INVALID_FIXTURE_STATES: "灯具状态数据无法解析，应为按灯具编号索引的通道对象",
  EMPTY_FIXTURE_STATES: "场景没有包含任何灯具状态"
};
