import type { Fixture } from "../../types/Fixture";

type Props = {
  fixture?: Fixture;
  /** 合成后的颜色 */
  color?: string;
  /** 合成后的亮度 0~100 */
  brightness?: number;
  active?: boolean;
  locked?: boolean;
  /** 兼容旧占位调用 */
  title?: string;
  value?: string;
  size?: number;
};

function Glyph({ fixtureType, size }: { fixtureType: string; size: number }) {
  const stroke = "rgba(20,26,22,.75)";
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.4 };
  switch (fixtureType) {
    case "PAR":
      return (
        <svg {...common}><rect x="5" y="5" width="14" height="14" rx="2" /><circle cx="12" cy="12" r="3.5" /></svg>
      );
    case "WASH":
      return (
        <svg {...common}><rect x="3" y="8" width="18" height="8" rx="4" /><path d="M7 8V5M12 8V4M17 8V5" /></svg>
      );
    case "BEAM":
      return (
        <svg {...common}><path d="M12 3l5 9H7z" /><path d="M9 16h6l-1 5h-4z" /></svg>
      );
    case "STROBE":
      return (
        <svg {...common}><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></svg>
      );
    case "SPOT":
    default:
      return (
        <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>
      );
  }
}

export function FixtureIcon({ fixture, color = "#000000", brightness = 0, active = false, locked = false, title, value, size = 34 }: Props) {
  if (!fixture) {
    return <span className="fixture-icon fixture-icon-placeholder" title={title}>{value ?? title ?? "FixtureIcon"}</span>;
  }
  const alpha = Math.max(0, Math.min(1, brightness / 100));
  return (
    <div
      className={"fixture-icon" + (active ? " active" : "") + (locked ? " locked" : "")}
      title={`${fixture.fixture_code} · ${fixture.fixture_type} · ${brightness}%${locked ? " · 锁定现场值" : ""}`}
      style={{ ["--fixture-color" as string]: color, ["--fixture-alpha" as string]: alpha }}
    >
      <Glyph fixtureType={fixture.fixture_type} size={size} />
      {locked && <span className="fixture-lock" aria-label="锁定">🔒</span>}
    </div>
  );
}
