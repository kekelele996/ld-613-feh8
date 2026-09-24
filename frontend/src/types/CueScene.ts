export interface FixtureStateValue {
  fixture_id: number;
  color: string;
  brightness: number;
}

export interface CueScene {
  id: number;
  name: string;
  fixture_states: FixtureStateValue[];
  fade_in_ms: number;
  hold_ms: number;
  priority: number;
  scene_status: string;
}
