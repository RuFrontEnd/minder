import { Dispatch, SetStateAction } from "react";
import * as CommonTypes from "@/types/common";
import * as InputTypes from "@/types/components/input";
import * as SelectTypes from "@/types/components/select";

type Props = {
  className?: string;
  text: string;
  isEditing: boolean;
  options: string[];
  datas: CommonTypes.Datas;
  addDatas: {
    val: null | string;
    comment: null | string;
    status: null | InputTypes.Status;
  }[];
  setAddDatas: Dispatch<SetStateAction<Props["addDatas"]>>;
  newDatas: {
    val: string;
    comment: null | string;
    status: null | SelectTypes.Status;
  }[];
  setNewDatas: Dispatch<SetStateAction<Props["newDatas"]>>;
};

export type { Props };
