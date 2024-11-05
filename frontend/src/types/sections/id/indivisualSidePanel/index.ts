import { Dispatch, SetStateAction } from "react";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";

type Props = {
  datas: {
    id: string;
    name: string;
  }[];
  isIndivisualSidePanelOpen: boolean;
  setIsIndivisualSidePanelOpen: Dispatch<
    SetStateAction<Props["isIndivisualSidePanelOpen"]>
  >;
  indivisual: null | Terminal | Process | Data | Desicion;
  setIndivisual: Dispatch<SetStateAction<Props["indivisual"]>>;
};

export type { Props };
