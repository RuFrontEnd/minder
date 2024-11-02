import { MouseEventHandler, ReactNode } from "react";

enum HorizentalD {
  l = "l",
  r = "r",
}

enum VerticalD {
  t = "t",
  b = "b",
  m = "m",
}

type Props = {
  id?: string;
  className?: string;
  role?: string;
  open?: boolean;
  w?: string;
  h?: string;
  horizentalD?: HorizentalD;
  verticalD?: VerticalD;
  children?: ReactNode;
  onClickSwitch?: MouseEventHandler<HTMLDivElement>;
};

export type { Props };

export { HorizentalD, VerticalD };
