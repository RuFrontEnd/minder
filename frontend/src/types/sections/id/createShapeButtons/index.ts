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
};

export type { Props };
