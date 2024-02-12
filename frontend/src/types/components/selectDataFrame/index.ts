import { Vec, Title, Data, DataItem } from "@/types/shapes/common";
import Process from "@/shapes/process";
import Desicion from "@/shapes/decision";

type Props = {
  shape: Process | Desicion;
  coordinate: Vec;
  onConfirm: (title: Title, data: Data) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

type Selections = { [dataId: DataItem["id"]]: boolean };

export type { Data, Props, Selections };
