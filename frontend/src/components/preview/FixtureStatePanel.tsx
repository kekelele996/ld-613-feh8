import { FixtureIcon } from "../common/FixtureIcon";
import { usePreviewStore } from "../../stores/PreviewStore";
import type { RenderedFixture } from "../../types/PreviewFrame";

type Props = {
  fixtures: RenderedFixture[];
};

/** 灯具状态：逐盏展示颜色/亮度及接管来源；锁定轨道灯具允许直接调现场亮度 */
export function FixtureStatePanel({ fixtures }: Props) {
  const setLockedBrightness = usePreviewStore((state) => state.setLockedBrightness);

  return (
    <div className="panel fixture-state-panel">
      <h2>灯具状态</h2>
      <ul className="fixture-state-list">
        {fixtures.map(({ fixture, color, brightness, active, locked, sourceScene, sourceTrack }) => (
          <li key={fixture.id} className={"fixture-state-item" + (active ? " is-active" : "") + (locked ? " is-locked" : "")}>
            <FixtureIcon fixture={fixture} color={color} brightness={brightness} active={active} locked={locked} size={28} />
            <div className="fixture-state-body">
              <div className="fixture-state-head">
                <strong>{fixture.fixture_code}</strong>
                <span className="fixture-state-type">{fixture.fixture_type} · {fixture.color_mode}</span>
              </div>
              <div className="fixture-state-values">
                <span className="color-chip" style={{ background: active ? color : "#000", borderColor: color }}>
                  {active ? color : "熄灯"}
                </span>
                {locked ? (
                  <label className="locked-brightness">
                    现场亮度
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={brightness}
                      onChange={(event) =>
                        sourceTrack && setLockedBrightness(sourceTrack.id, fixture.id, Number(event.target.value))
                      }
                    />
                    <strong>{brightness}%</strong>
                  </label>
                ) : (
                  <span className="brightness-readout">亮度 <strong>{brightness}%</strong></span>
                )}
              </div>
              <div className="fixture-state-source">
                {sourceScene
                  ? `接管：${sourceScene.name}（轨道 #${sourceTrack?.id ?? "-"}${locked ? " · 锁定" : ""}）`
                  : "当前时刻无场景控制"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
