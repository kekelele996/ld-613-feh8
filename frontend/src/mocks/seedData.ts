import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { ShowProject } from "../types/ShowProject";
import type { TimelineTrack } from "../types/TimelineTrack";

const fixtures: Fixture[] = [
  { id: 1, fixture_code: "PAR-L-01", fixture_type: "PAR", position_x: 12, position_y: 22, dmx_address: 1, channel_count: 4, color_mode: "RGBW" },
  { id: 2, fixture_code: "PAR-R-01", fixture_type: "PAR", position_x: 88, position_y: 22, dmx_address: 5, channel_count: 4, color_mode: "RGBW" },
  { id: 3, fixture_code: "WASH-C-01", fixture_type: "WASH", position_x: 50, position_y: 18, dmx_address: 9, channel_count: 4, color_mode: "RGB" },
  { id: 4, fixture_code: "SPOT-L-01", fixture_type: "SPOT", position_x: 30, position_y: 68, dmx_address: 13, channel_count: 1, color_mode: "DIMMER_ONLY" },
  { id: 5, fixture_code: "SPOT-R-01", fixture_type: "SPOT", position_x: 70, position_y: 68, dmx_address: 14, channel_count: 1, color_mode: "DIMMER_ONLY" },
  { id: 6, fixture_code: "BEAM-M-01", fixture_type: "BEAM", position_x: 50, position_y: 45, dmx_address: 15, channel_count: 6, color_mode: "MOVING_HEAD" }
];

const cueScenes: CueScene[] = [
  {
    id: 1,
    name: "暖场环境光",
    fixture_states: [
      { fixture_id: 1, color: "#ff9d3c", brightness: 55 },
      { fixture_id: 2, color: "#ff9d3c", brightness: 55 },
      { fixture_id: 3, color: "#ffc36e", brightness: 40 }
    ],
    fade_in_ms: 1500,
    hold_ms: 6000,
    priority: 5,
    scene_status: "READY"
  },
  {
    id: 2,
    name: "红色高潮",
    fixture_states: [
      { fixture_id: 1, color: "#e52222", brightness: 95 },
      { fixture_id: 2, color: "#e52222", brightness: 95 },
      { fixture_id: 3, color: "#ff4d4d", brightness: 80 },
      { fixture_id: 6, color: "#ff2a2a", brightness: 90 }
    ],
    fade_in_ms: 800,
    hold_ms: 5000,
    priority: 8,
    scene_status: "READY"
  },
  {
    id: 3,
    name: "追光定点",
    fixture_states: [
      { fixture_id: 4, color: "#ffffff", brightness: 100 },
      { fixture_id: 5, color: "#ffffff", brightness: 30 }
    ],
    fade_in_ms: 500,
    hold_ms: 4000,
    priority: 6,
    scene_status: "READY"
  },
  {
    id: 4,
    name: "冷蓝收束",
    fixture_states: [
      { fixture_id: 3, color: "#2f6bff", brightness: 60 },
      { fixture_id: 6, color: "#4dd2ff", brightness: 70 }
    ],
    fade_in_ms: 2000,
    hold_ms: 5000,
    priority: 7,
    scene_status: "READY"
  },
  {
    id: 5,
    name: "锁定面光（现场值）",
    fixture_states: [
      { fixture_id: 4, color: "#fff6e0", brightness: 75 },
      { fixture_id: 5, color: "#fff6e0", brightness: 75 }
    ],
    fade_in_ms: 0,
    hold_ms: 0,
    priority: 9,
    scene_status: "READY"
  },
  {
    id: 6,
    name: "草稿频闪（未就绪）",
    fixture_states: [
      { fixture_id: 6, color: "#ffffff", brightness: 100 }
    ],
    fade_in_ms: 100,
    hold_ms: 200,
    priority: 10,
    scene_status: "DRAFT"
  },
  {
    id: 7,
    name: "已禁用绿光",
    fixture_states: [
      { fixture_id: 1, color: "#22dd55", brightness: 80 }
    ],
    fade_in_ms: 400,
    hold_ms: 3000,
    priority: 4,
    scene_status: "DISABLED"
  },
  {
    id: 8,
    name: "错误颜色场景",
    fixture_states: [
      { fixture_id: 3, color: "red", brightness: 65 }
    ],
    fade_in_ms: 600,
    hold_ms: 2000,
    priority: 6,
    scene_status: "READY"
  },
  {
    id: 9,
    name: "亮度越界场景",
    fixture_states: [
      { fixture_id: 2, color: "#ffffff", brightness: 200 }
    ],
    fade_in_ms: 300,
    hold_ms: 2000,
    priority: 6,
    scene_status: "READY"
  },
  {
    id: 10,
    name: "引用已删除灯具",
    fixture_states: [
      { fixture_id: 99, color: "#ffffff", brightness: 80 }
    ],
    fade_in_ms: 300,
    hold_ms: 2000,
    priority: 6,
    scene_status: "READY"
  },
  {
    id: 11,
    name: "空状态场景",
    fixture_states: [],
    fade_in_ms: 500,
    hold_ms: 1000,
    priority: 5,
    scene_status: "READY"
  }
];

const timelineTracks: TimelineTrack[] = [
  // 普通解锁轨道，按 start/duration 在时间轴上激活
  { id: 1, cue_scene_id: 1, start_ms: 0, duration_ms: 8000, layer: 1, locked: false },
  { id: 2, cue_scene_id: 2, start_ms: 8000, duration_ms: 7000, layer: 2, locked: false },
  { id: 3, cue_scene_id: 3, start_ms: 5000, duration_ms: 8000, layer: 3, locked: false },
  { id: 4, cue_scene_id: 4, start_ms: 16000, duration_ms: 8000, layer: 2, locked: false },
  // 锁定轨道：保留现场值，与时间无关（层级 3、场景优先级 9，始终接管 4/5 号灯）
  { id: 5, cue_scene_id: 5, start_ms: 0, duration_ms: 0, layer: 3, locked: true },
  // —— 以下轨道会被跳过，并在旁边说明原因 ——
  { id: 6, cue_scene_id: 6, start_ms: 2000, duration_ms: 4000, layer: 4, locked: false },
  { id: 7, cue_scene_id: 7, start_ms: 10000, duration_ms: 4000, layer: 1, locked: false },
  { id: 8, cue_scene_id: 8, start_ms: 12000, duration_ms: 3000, layer: 4, locked: false },
  { id: 9, cue_scene_id: 9, start_ms: 14000, duration_ms: 3000, layer: 4, locked: false },
  { id: 10, cue_scene_id: 10, start_ms: 3000, duration_ms: 3000, layer: 2, locked: false },
  { id: 11, cue_scene_id: 11, start_ms: 6000, duration_ms: 2000, layer: 1, locked: false },
  // 关联了不存在的场景
  { id: 12, cue_scene_id: 404, start_ms: 0, duration_ms: 2000, layer: 1, locked: false },
  // 轨道本身无效：持续时间非正数
  { id: 13, cue_scene_id: 1, start_ms: 20000, duration_ms: 0, layer: 1, locked: false }
];

const showProjects: ShowProject[] = [
  {
    id: 1,
    title: "晚场演唱会 A 版",
    venue_name: "一号演播厅",
    fixture_ids: [1, 2, 3, 4, 5, 6],
    track_ids: [1, 2, 3, 4, 5],
    updated_at: "2026-09-20T09:00:00Z"
  }
];

export const mockData = {
  fixture: fixtures,
  cueScene: cueScenes,
  timelineTrack: timelineTracks,
  showProject: showProjects
};
