import { MouseEventHandler } from "react";

enum Type {
  x = "x",
  xCircle = 'x-circle',
  tick = "tick",
  tickCircle = 'tick-circle',
  pencilSquare = "pencil-square",
  ellipse = "ellipse",
  square = "square",
  parallelogram = "parallelogram",
  dimond = "dimond",
  rotateCcw = "rotateCcw",
  arrow = "arrow",
  arrowSolid = "arrow-solid",
  exclaimationMarkTriangle = 'exclaimation-markTriangle'
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
