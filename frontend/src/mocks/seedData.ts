// 本地种子数据：字段仍按 IndexedDB 字符串约定存储
// （数值、布尔均为字符串；fixture_states 为 JSON 字符串）。
// 时间轴总长 12s，编排刻意覆盖以下评审点：
//  - 2s 起蓝场与红场同为 layer 1，红场 priority(20) > 蓝场(10)，红场接管
//  - 5s 起 layer 2 的暖白场压住同灯具上的 layer 1 场景
//  - 轨道 #4 锁定，🔒 全程保留现场值，不随播放进度变化
//  - 轨道 #5/#6/#7/#8 分别因未就绪 / 无效状态 JSON / 空状态 / 非法时间被跳过
export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "P-01 面光左",
      "fixture_type": "SPOT",
      "position_x": "18",
      "position_y": "30",
      "dmx_address": "1",
      "channel_count": 4,
      "color_mode": "RGB"
    },
    {
      "id": 2,
      "fixture_code": "P-02 面光右",
      "fixture_type": "SPOT",
      "position_x": "78",
      "position_y": "30",
      "dmx_address": "5",
      "channel_count": 4,
      "color_mode": "RGB"
    },
    {
      "id": 3,
      "fixture_code": "W-01 顶光",
      "fixture_type": "WASH",
      "position_x": "48",
      "position_y": "16",
      "dmx_address": "9",
      "channel_count": 4,
      "color_mode": "RGBW"
    },
    {
      "id": 4,
      "fixture_code": "B-01 光束",
      "fixture_type": "BEAM",
      "position_x": "48",
      "position_y": "62",
      "dmx_address": "13",
      "channel_count": 6,
      "color_mode": "MOVING_HEAD"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "开场蓝场",
      "fixture_states": JSON.stringify({
        "1": { "r": 40, "g": 90, "b": 255, "brightness": 80 },
        "2": { "r": 40, "g": 90, "b": 255, "brightness": 80 },
        "4": { "r": 40, "g": 90, "b": 255, "brightness": 60 }
      }),
      "fade_in_ms": "1000",
      "hold_ms": "3000",
      "priority": "10",
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "主推红场",
      "fixture_states": JSON.stringify({
        "1": { "r": 255, "g": 60, "b": 70, "brightness": 95 },
        "2": { "r": 255, "g": 60, "b": 70, "brightness": 95 },
        "4": { "r": 255, "g": 40, "b": 90, "brightness": 90 }
      }),
      "fade_in_ms": "500",
      "hold_ms": "4000",
      "priority": "20",
      "scene_status": "READY"
    },
    {
      "id": 3,
      "name": "暖白高潮",
      "fixture_states": JSON.stringify({
        "1": { "r": 255, "g": 230, "b": 180, "brightness": 100 },
        "2": { "r": 255, "g": 230, "b": 180, "brightness": 100 },
        "3": { "r": 255, "g": 240, "b": 200, "brightness": 100 },
        "4": { "r": 255, "g": 220, "b": 160, "brightness": 75 }
      }),
      "fade_in_ms": "1500",
      "hold_ms": "3000",
      "priority": "10",
      "scene_status": "READY"
    },
    {
      "id": 4,
      "name": "锁定·观众灯现场值",
      "fixture_states": JSON.stringify({
        "1": { "r": 120, "g": 255, "b": 140, "brightness": 55 },
        "2": { "r": 120, "g": 255, "b": 140, "brightness": 55 }
      }),
      "fade_in_ms": "0",
      "hold_ms": "0",
      "priority": "5",
      "scene_status": "READY"
    },
    {
      "id": 5,
      "name": "草稿频闪（未就绪）",
      "fixture_states": JSON.stringify({
        "3": { "r": 255, "g": 255, "b": 255, "brightness": 100 }
      }),
      "fade_in_ms": "100",
      "hold_ms": "500",
      "priority": "30",
      "scene_status": "DRAFT"
    },
    {
      "id": 6,
      "name": "数据损坏的终场",
      "fixture_states": "{not-valid-json",
      "fade_in_ms": "800",
      "hold_ms": "2000",
      "priority": "15",
      "scene_status": "READY"
    },
    {
      "id": 7,
      "name": "空白场景",
      "fixture_states": JSON.stringify({}),
      "fade_in_ms": "0",
      "hold_ms": "0",
      "priority": "1",
      "scene_status": "READY"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": "0",
      "duration_ms": "5000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": "2000",
      "duration_ms": "4000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": "5000",
      "duration_ms": "7000",
      "layer": "2",
      "locked": "false"
    },
    {
      "id": 4,
      "cue_scene_id": 4,
      "start_ms": "0",
      "duration_ms": "12000",
      "layer": "0",
      "locked": "true"
    },
    {
      "id": 5,
      "cue_scene_id": 5,
      "start_ms": "8000",
      "duration_ms": "2000",
      "layer": "3",
      "locked": "false"
    },
    {
      "id": 6,
      "cue_scene_id": 6,
      "start_ms": "10000",
      "duration_ms": "2000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 7,
      "cue_scene_id": 7,
      "start_ms": "0",
      "duration_ms": "3000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 8,
      "cue_scene_id": 2,
      "start_ms": "稍后",
      "duration_ms": "2000",
      "layer": "1",
      "locked": "false"
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "联排主方案",
      "venue_name": "一号排练厅",
      "fixture_ids": [1, 2, 3, 4],
      "track_ids": [1, 2, 3, 4, 5, 6, 7, 8],
      "updated_at": "2026-09-20T09:00:00Z"
    }
  ]
} as const;
