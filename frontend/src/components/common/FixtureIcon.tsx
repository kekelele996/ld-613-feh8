import type { FixtureType } from "../../types/FixtureType";
import { formatChannel } from "../../utils/formatters";

export interface FixtureIconProps {
  fixtureType?: FixtureType | string;
  /** 0-255 RGB 通道 */
  r?: number;
  g?: number;
  b?: number;
  /** 0-100 主控亮度 */
  brightness?: number;
  locked?: boolean;
  size?: number;
  title?: string;
}

/**
 * 舞台灯具图标：按合成后的 RGB 通道与亮度渲染发光体，
 * 灯具类型决定外框形状（STROBE/BEAM 菱形，WASH 方形，其余圆形）。
 */
export function FixtureIcon({
  fixtureType = "PAR",
  r = 0,
  g = 0,
  b = 0,
  brightness = 0,
  locked = false,
  size = 34,
  title
}: FixtureIconProps) {
  const level = Math.min(1, Math.max(0, brightness / 100));
  const color = `rgb(${Math.round(r * level)},${Math.round(g * level)},${Math.round(b * level)})`;
  const shape =
    fixtureType === "STROBE" || fixtureType === "BEAM"
      ? "fixture-icon--diamond"
      : fixtureType === "WASH"
        ? "fixture-icon--square"
        : "fixture-icon--round";
  const tooltip =
    title ??
    `${fixtureType} · R${formatChannel(r)} G${formatChannel(g)} B${formatChannel(b)} · ${Math.round(brightness)}%${locked ? " · 锁定现场值" : ""}`;

  return (
    <span
      className={`fixture-icon ${shape}${brightness <= 0 ? " fixture-icon--off" : ""}`}
      title={tooltip}
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: brightness > 0 ? `0 0 ${10 + 22 * level}px ${4 + 10 * level}px rgba(${r},${g},${b},${0.15 + 0.55 * level})` : undefined
      }}
    >
      {locked ? <span className="fixture-icon__lock" title="锁定轨道保持的现场值">🔒</span> : null}
    </span>
  );
}
