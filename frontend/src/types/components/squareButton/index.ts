import { KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";

enum Part {
  independent = "independent",
  left = "left",
  middle = "middle",
  right = "right",
}

type Props = {
  id?: string;
  className?: string;
  style?: Object;
  tabIndex?: number;
  content?: ReactNode;
  size?: number;
  w?: number;
  h?: number;
  shadow?: boolean;
  part?: Part;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
};

export type { Props };
export { Part };
