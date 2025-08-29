import Selection from "@/shapes/selection";
import { Dispatch, SetStateAction } from "react";
import * as CommonTypes from "@/types/common";
import * as PageIdTypes from "@/types/app/pageId";
import * as CoreTypes from "@/types/shapes/core";

type Console = {
  shape: {
    id: string;
    status: CoreTypes.Status;
    datas: {
      id: string;
      i: number;
      text: string;
      status: CommonTypes.DataStatus;
      console: {
        message: string;
        status: CommonTypes.ConsoleStatus;
      };
    }[];
  };
  message: string;
  status: CommonTypes.ConsoleStatus;
};

type Consoles = Console[];

type Props = {
  shapesObservable: CommonTypes.ShapesObservable;
  connectionCurves: CommonTypes.ConnectionCurves;
  updateConnectionCurves: PageIdTypes.UpdateConnectionCurves;
  selection: null | Selection;
  undo: () => void;
  positioning: PageIdTypes.Positioning;
  setIndivisual: Dispatch<SetStateAction<PageIdTypes.Indivisual>>;
  setIsIndivisualSidePanelOpen: Dispatch<SetStateAction<boolean>>;
  isConsoleOpen: boolean;
  setIsConsoleOpen: Dispatch<SetStateAction<boolean>>;
  isOverAllSidePanelOpen: boolean;
  isIndivisualSidePanelOpen: boolean;
  actionRecords: PageIdTypes.ActionRecords;
  offset: CommonTypes.Vec;
  scale: number;
  reload: () => void;
  zoom: PageIdTypes.Zoom;
  consoles: Consoles;
};

export type { Props, Console, Consoles };
