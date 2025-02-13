import { Dispatch, SetStateAction } from "react";
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
  positioning: PageIdTypes.Positioning;
  steps: CommonTypes.Steps;
  datas: CommonTypes.OverallDatas;
  setDatas: Dispatch<SetStateAction<Props["datas"]>>;
  projectName: CommonTypes.ProjectName;
  setProjectName: Dispatch<SetStateAction<Props["projectName"]>>;
  updateShapes: PageIdTypes.UpdateShapes;
  shapes: CommonTypes.Shapes;
  isOverAllSidePanelOpen: boolean;
  setIsOverAllSidePanelOpen: Dispatch<
    SetStateAction<Props["isOverAllSidePanelOpen"]>
  >;
};

export type { Props, CreateDatas, AddDatas };
