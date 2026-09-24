export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

/** 毫秒 -> mm:ss.cs，时间轴刻度与进度读数共用 */
export const formatTimecode = (ms: number) => {
  const safe = Math.max(0, Number.isFinite(ms) ? ms : 0);
  const totalCs = Math.round(safe / 10);
  const cs = totalCs % 100;
  const totalSeconds = Math.floor(totalCs / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

/** 0~1 -> 百分比文本 */
export const formatPercent = (ratio: number) => `${Math.round((Number.isFinite(ratio) ? ratio : 0) * 100)}%`;
