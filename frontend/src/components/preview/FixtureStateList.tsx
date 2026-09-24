import type { CompositeFixtureState } from "../../types/Playback";
import type { Fixture } from "../../types/Fixture";
import { FixtureIcon } from "../common/FixtureIcon";
import { formatChannel } from "../../utils/formatters";

export interface FixtureStateListProps {
  fixtures: Fixture[];
  states: CompositeFixtureState[];
}

/** 当前时刻每盏灯的通道值、亮度与接管场景；锁定灯单独标注。 */
export function FixtureStateList({ fixtures, states }: FixtureStateListProps) {
  const stateByFixture = new Map(states.map((state) => [state.fixtureId, state]));

  return (
    <div className="fixture-state-list">
      <h3>灯具实时状态（{fixtures.length}）</h3>
      {fixtures.length === 0 ? (
        <p className="muted">没有灯具数据。</p>
      ) : (
        <ul>
          {fixtures.map((fixture) => {
            const state = stateByFixture.get(fixture.id);
            const controlled = Boolean(state?.sourceScene);
            return (
              <li key={fixture.id} className={controlled ? "" : "fixture-state-list__row--idle"}>
                <FixtureIcon
                  fixtureType={fixture.fixture_type}
                  r={state?.r ?? 0}
                  g={state?.g ?? 0}
                  b={state?.b ?? 0}
                  brightness={state?.brightness ?? 0}
                  locked={state?.locked ?? false}
                  size={26}
                />
                <div className="fixture-state-list__meta">
                  <strong>
                    {fixture.fixture_code}
                    <span className="fixture-state-list__type">{fixture.fixture_type}</span>
                    {state?.locked ? <span className="fixture-state-list__locked">锁定现场值</span> : null}
                  </strong>
                  <span className="fixture-state-list__source">
                    {controlled ? `接管场景：${state!.sourceScene}` : "当前无场景控制，保持熄灭"}
                  </span>
                </div>
                <div className="fixture-state-list__channels">
                  <span className="channel channel--r">R{formatChannel(state?.r ?? 0)}</span>
                  <span className="channel channel--g">G{formatChannel(state?.g ?? 0)}</span>
                  <span className="channel channel--b">B{formatChannel(state?.b ?? 0)}</span>
                  <span className="channel channel--d">{Math.round(state?.brightness ?? 0)}%</span>
                  <span className="fixture-state-list__fade">
                    淡入 {Math.round((state?.fadeProgress ?? 0) * 100)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
