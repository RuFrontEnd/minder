import { MouseEventHandler } from "react";

enum Type {
  x = "x",
  xCircle = "x-circle",
  exclaimationMarkTriangle = "exclaimation-markTriangle",
  tick = "tick",
  tickCircle = "tick-circle",
  pencilSquare = "pencil-square",
  ellipse = "ellipse",
  square = "square",
  parallelogram = "parallelogram",
  dimond = "dimond",
  rotateCcw = "rotateCcw",
  arrow = "arrow",
  arrowSolid = "arrow-solid",
  plus = "plus",
  minus = "minus",
  bars = "bars",
  sight = "sight",
  download = "download",
  upload = "upload",
}

type Props = {
  key?: string;
  id?: string;
  className?: string;
  style?: object;
  role?: string;
  type?: Type;
  w?: number;
  h?: number;
  fill?: string;
  stroke?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLOrSVGElement>;
};

export { Type };
export type { Props };
