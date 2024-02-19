import { Vec, Title, Data as DataType, DataItem } from "@/types/shapes/common";
import Terminator from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";

type Props = {
  shape: Terminator | Process | Data | Desicion;
  coordinate: Vec;
  feature: {
    import: boolean;
    usage: boolean;
    redundancy: boolean
  }
  onConfirm: (title: Title, data: DataType, selectedData: DataType) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

type Selections = { [dataId: DataItem["id"]]: boolean };

export type { Props, Selections };
