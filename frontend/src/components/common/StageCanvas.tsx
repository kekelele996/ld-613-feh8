import type { CompositeFixtureState } from "../../types/Playback";
import type { Fixture } from "../../types/Fixture";
import { FixtureIcon } from "./FixtureIcon";
import { parsePositionField } from "../../utils/previewFields";
import { formatChannel } from "../../utils/formatters";

export interface StageCanvasProps {
  fixtures: Fixture[];
  states: CompositeFixtureState[];
}

const resolvePosition = (fixture: Fixture, index: number) => {
  const x = parsePositionField(fixture.position_x);
  const y = parsePositionField(fixture.position_y);
  // 种子/导入数据里坐标缺失时退化成均匀网格，保证灯仍可见可点。
  const fallbackX = 10 + ((index * 23) % 80);
  const fallbackY = 18 + ((index * 37) % 64);
  return { x: x ?? fallbackX, y: y ?? fallbackY };
};

/**
 * 二维舞台预览：灯具按 position_x / position_y（0-100 百分比）布点，
 * 颜色亮度直接取当前帧的合成结果；标注来源场景，锁定灯显示锁标记。
 */
export function StageCanvas({ fixtures, states }: StageCanvasProps) {
  const stateByFixture = new Map(states.map((state) => [state.fixtureId, state]));

  return (
    <div className="stage-canvas" role="img" aria-label="二维舞台灯光预览">
      <div className="stage-canvas__proscenium" aria-hidden>舞台 / STAGE</div>
      {fixtures.length === 0 ? (
        <p className="stage-canvas__empty">当前演出方案没有灯具，无法合成现场效果。</p>
      ) : null}
      {fixtures.map((fixture, index) => {
        const state = stateByFixture.get(fixture.id);
        const { x, y } = resolvePosition(fixture, index);
        return (
          <div
            key={fixture.id}
            className="stage-canvas__fixture"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <FixtureIcon
              fixtureType={fixture.fixture_type}
              r={state?.r ?? 0}
              g={state?.g ?? 0}
              b={state?.b ?? 0}
              brightness={state?.brightness ?? 0}
              locked={state?.locked ?? false}
            />
            <span className="stage-canvas__code">{fixture.fixture_code}</span>
            {state?.sourceScene ? (
              <span className="stage-canvas__source">
                {state.sourceScene}
                <em>
                  R{formatChannel(state.r)} G{formatChannel(state.g)} B{formatChannel(state.b)} ·{" "}
                  {Math.round(state.brightness)}%
                </em>
              </span>
            ) : (
              <span className="stage-canvas__source stage-canvas__source--idle">未受控 · 熄灭</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
