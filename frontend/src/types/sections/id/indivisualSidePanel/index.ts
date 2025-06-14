import { Dispatch, SetStateAction } from "react";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as InputTypes from "@/types/components/input";
import * as SelectTypes from "@/types/components/input";
import * as CommonTypes from "@/types/common";
import * as PageIdTypes from "@/types/app/pageId";

type CreateDatas = {
  val: null | string;
  comment: null | string;
  status: null | InputTypes.Status;
}[];

type AddDatas = {
  val: string;
  comment: null | string;
  status: null | SelectTypes.Status;
}[];

type Props = {
  projectName: string;
  setProjectName: Dispatch<SetStateAction<CommonTypes.ProjectName>>
  shapes: (Terminal | Process | Data | Desicion)[];
  curves: CommonTypes.ConnectionCurves;
  datas: CommonTypes.OverallDatas;
  setDatas: Dispatch<SetStateAction<Props["datas"]>>;
  isIndivisualSidePanelOpen: boolean;
  setIsIndivisualSidePanelOpen: Dispatch<
    SetStateAction<Props["isIndivisualSidePanelOpen"]>
  >;
  indivisual: PageIdTypes.Indivisual;
  setIndivisual: Dispatch<SetStateAction<Props["indivisual"]>>;
  isEditingIndivisual: boolean;
  setIsEditingIndivisual: Dispatch<
    SetStateAction<Props["isEditingIndivisual"]>
  >;
  createImportDatas: CreateDatas;
  setCreateImportDatas: Dispatch<SetStateAction<CreateDatas>>;
  addImportDatas: AddDatas;
  setAddImportDatas: Dispatch<SetStateAction<AddDatas>>;
  createUsingDatas: CreateDatas;
  setCreateUsingDatas: Dispatch<SetStateAction<CreateDatas>>;
  addUsingDatas: AddDatas;
  setAddUsingDatas: Dispatch<SetStateAction<AddDatas>>;
  createDeleteDatas: CreateDatas;
  setCreateDeleteDatas: Dispatch<SetStateAction<CreateDatas>>;
  addDeleteDatas: AddDatas;
  setAddDeleteDatas: Dispatch<SetStateAction<AddDatas>>;
  draw: () => void;
  updateShapes: (newShapes: (Terminal | Process | Data | Desicion)[]) => void;
  updateCurves: (newCurves: CommonTypes.ConnectionCurves) => void;
  consoles: any;
  setConsoles: any;
  terminateDataChecking: () => void;
  deSelect: () => void;
};

export type { Props, CreateDatas, AddDatas };
