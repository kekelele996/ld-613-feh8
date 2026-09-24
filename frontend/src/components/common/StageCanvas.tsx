import { FixtureIcon } from "./FixtureIcon";
import type { RenderedFixture } from "../../types/PreviewFrame";

type Props = {
  fixtures?: RenderedFixture[];
  /** 兼容旧占位调用 */
  title?: string;
  value?: string;
};

/**
 * 二维舞台：position_x/position_y 为百分比坐标，
 * 灯具颜色/亮度来自按时刻合成后的 RenderedFixture。
 */
export function StageCanvas({ fixtures = [], title, value }: Props) {
  if (fixtures.length === 0) {
    return (
      <div className="shared-widget stage-canvas stage-canvas-empty">
        <strong>{title ?? "StageCanvas"}</strong>
        {value ? <span>{value}</span> : <span>暂无可绘制的灯具</span>}
      </div>
    );
  }

  return (
    <div className="stage-canvas" role="img" aria-label="二维舞台灯具现场效果">
      <div className="stage-backdrop" />
      {fixtures.map(({ fixture, color, brightness, active, locked, sourceScene }) => (
        <div
          key={fixture.id}
          className={"stage-fixture" + (active ? " is-active" : "") + (locked ? " is-locked" : "")}
          style={{ left: `${fixture.position_x}%`, top: `${fixture.position_y}%` }}
        >
          <span
            className="stage-halo"
            style={{ background: color, opacity: active ? brightness / 100 : 0 }}
            aria-hidden
          />
          <FixtureIcon fixture={fixture} color={color} brightness={brightness} active={active} locked={locked} />
          <span className="stage-fixture-label">
            {fixture.fixture_code}
            {sourceScene ? ` · ${brightness}%` : " · 熄灯"}
          </span>
        </div>
      ))}
    </div>
  );
}
