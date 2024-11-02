import { MouseEventHandler } from "react";

enum Type {
  x = "x",
  pencilSquare = "pencil-square",
  ellipse = "ellipse",
  square = "square",
  parallelogram = "parallelogram",
  dimond = "dimond",
  rotateCcw = "rotateCcw",
  arrowLeft = "arrowLeft"
}

type Props = {
  key?: string;
  id?: string;
  className?: string;
  style?: object;
  type?: Type;
  w?: number;
  h?: number;
  fill?: string;
  stroke?: string;
  onClick?: MouseEventHandler<HTMLOrSVGElement>;
};

export { Type };
export type { Props };
