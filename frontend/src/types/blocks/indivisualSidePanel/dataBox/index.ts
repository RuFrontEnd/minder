import { Dispatch, SetStateAction, CSSProperties } from "react";
import * as CommonTypes from "@/types/common";
import * as InputTypes from "@/types/components/input";
import * as SelectTypes from "@/types/components/select";

type Props = {
  style?: CSSProperties;
  className?: string;
  text: string;
  isEditing: boolean;
  options: string[];
  datas: CommonTypes.Datas;
  createDatas: {
    val: null | string;
    comment: null | string;
    status: null | InputTypes.Status;
  }[];
  setCreateDatas: Dispatch<SetStateAction<Props["createDatas"]>>;
  addDatas: {
    val: string;
    comment: null | string;
    status: null | SelectTypes.Status;
  }[];
  setAddDatas: Dispatch<SetStateAction<Props["addDatas"]>>;
};

export type { Props };
