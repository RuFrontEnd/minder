import { Dispatch, SetStateAction } from "react";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as InputTypes from "@/types/components/input";
import * as SelectTypes from "@/types/components/input";
import * as CommonTypes from "@/types/common";

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
  positioning: CommonTypes.Positioning;
  steps: CommonTypes.Steps;
  datas: CommonTypes.OverallDatas;
  setDatas: Dispatch<SetStateAction<Props["datas"]>>;
  projectName:CommonTypes.ProjectName;
  setProjectName:Dispatch<SetStateAction<Props["projectName"]>>;
};

export type { Props, CreateDatas, AddDatas };
