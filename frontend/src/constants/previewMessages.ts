/** 舞台预览跳过原因模板（集中维护，页面旁注统一引用） */
export const PREVIEW_SKIP_REASONS = {
  SCENE_NOT_FOUND: "找不到关联场景",
  STATUS_NOT_READY: (status: string) => `场景未就绪（状态 ${status || "空"}，仅 READY 可参与预览）`,
  STATES_EMPTY: "场景未设置任何灯具状态",
  FIXTURE_NOT_FOUND: (id: number) => `灯具 #${id} 不存在`,
  COLOR_INVALID: (id: number, color: string) => `灯具 #${id} 颜色值无效（收到 "${color}"，需为 #RRGGBB）`,
  BRIGHTNESS_INVALID: (id: number, value: unknown) => `灯具 #${id} 亮度无效（收到 "${String(value)}"，需为 0~100 的数值）`,
  DURATION_INVALID: "轨道持续时间必须为正数"
} as const;

export const PREVIEW_LABELS = {
  title: "舞台预览",
  playbackHint: "拖动时间轴或按播放查看合成效果",
  currentScene: "当前场景",
  progress: "进度",
  fixtureStates: "灯具状态",
  skippedScenes: "跳过的场景",
  noActiveScene: "当前时刻没有活动场景",
  noSkipped: "没有被跳过的场景",
  lockedNote: "锁定轨道保留现场值，不随播放进度变化"
} as const;
