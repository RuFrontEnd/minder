import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";

type ActionRecords = {
  register: (type: CommonTypes.Action) => void;
  interrupt: (type: CommonTypes.Action) => void;
  finish: (type: CommonTypes.Action) => void;
};

type Props = {
  isOverAllSidePanelOpen: boolean;
  actionRecords: ActionRecords;
  shapes: (Terminal | Process | Data | Desicion)[];
  offset: CommonTypes.Vec;
  scale: number;
  reload: () => void;
};

export type { ActionRecords, Props };
