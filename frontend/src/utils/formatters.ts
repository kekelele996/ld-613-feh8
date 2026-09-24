export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

/** 毫秒 -> mm:ss.cs，时间轴播放头与拖拽标尺共用。 */
export const formatTimecode = (ms: number): string => {
  const safe = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  const centis = Math.floor((safe % 1000) / 10);
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
};

/** 0-255 通道值格式化为 000-255 的三位数，方便灯具状态列表对齐。 */
export const formatChannel = (value: number): string => String(Math.round(value)).padStart(3, "0");
