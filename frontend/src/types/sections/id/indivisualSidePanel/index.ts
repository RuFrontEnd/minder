import { Dispatch, SetStateAction } from "react";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as InputTypes from '@/types/components/input';
import * as SelectTypes from '@/types/components/input';

type CreateDatas = {
  val: null | string;
  comment: null | string;
  status: null | InputTypes.Status;
}[];

type AddDatas = {
  val: string;
  comment: null | string;
  status: null | SelectTypes.Status;
}[]

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

export type { Props, CreateDatas, AddDatas };
