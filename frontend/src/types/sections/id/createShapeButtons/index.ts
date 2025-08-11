import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";
import * as PageIdTypes from "@/types/app/pageId";

type Props = {
  isOverAllSidePanelOpen: boolean;
  actionRecords: PageIdTypes.ActionRecords;
  shapes: (Terminal | Process | Data | Desicion)[];
  offset: CommonTypes.Vec;
  scale: number;
  reload: () => void;
};

enum CreateShapeType {
  terminator = CommonTypes.ShapeType.terminator,
  process = CommonTypes.ShapeType.process,
  data = CommonTypes.ShapeType.data,
  decision = CommonTypes.ShapeType.decision,
}

export type { Props };

export { CreateShapeType };
