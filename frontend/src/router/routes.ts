import type { ComponentType } from "react";
import { CuesPage } from "../pages/CuesPage";
import { FixturesPage } from "../pages/FixturesPage";
import { PreviewPage } from "../pages/PreviewPage";
import { TimelinePage } from "../pages/TimelinePage";

export interface AppRoute {
  name: string;
  route: string;
  page: ComponentType;
}

export const routes: AppRoute[] = [
  { name: "灯具布置", route: "/fixtures", page: FixturesPage },
  { name: "场景编辑", route: "/cues", page: CuesPage },
  { name: "时间轴编排", route: "/timeline", page: TimelinePage },
  { name: "舞台预览", route: "/preview", page: PreviewPage }
];
