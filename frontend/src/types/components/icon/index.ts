import { MouseEventHandler } from "react";

enum Type {
  x = "x",
  pencilSquare = "pencil-square",
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