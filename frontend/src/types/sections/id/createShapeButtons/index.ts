import * as CommonTypes from "@/types/common";
import * as PageIdTypes from "@/types/app/pageId";

type Props = {
  isOverAllSidePanelOpen: boolean;
  actionRecords: PageIdTypes.ActionRecords;
  shapes: CommonTypes.Shape[];
  updateShapes: (newShapes: CommonTypes.Shape[]) => void;
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
