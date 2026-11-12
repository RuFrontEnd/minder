import * as CommonTypes from "@/types/common";
import * as PageIdTypes from "@/types/app/pageId";

type Props = {
  isOverAllSidePanelOpen: boolean;
  actionRecords: PageIdTypes.ActionRecords;
  shapes: CommonTypes.Shapes;
  offset: CommonTypes.Vec;
  scale: number;
  initShapeSize: {
    t: {
      w: number;
      h: number;
    };
    p: {
      w: number;
      h: number;
    };
    d: {
      w: number;
      h: number;
    };
    dec: {
      w: number;
      h: number;
    };
  };
  reload: () => void;
  onCreateStep: (step: CommonTypes.Step) => Promise<void>;
  isConnectMode: boolean;
  onChangeConnectMode: (isEnabled: boolean) => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export type { Props };
