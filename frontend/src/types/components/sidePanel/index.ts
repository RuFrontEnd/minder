import { MouseEventHandler, ReactNode } from "react";

enum Flow {
  row = "row",
  column = "column",
}

enum SwitchButtonD {
  start = "start",
  m = "m",
  end = "end",
}

enum HorizentalD {
  l = "l",
  r = "r",
  m = "m",
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
  flow?: Flow;
  switchButtonD?: SwitchButtonD;
  horizentalD?: HorizentalD;
  verticalD?: VerticalD;
  children?: ReactNode;
  onClickSwitch?: MouseEventHandler<HTMLDivElement>;
};

export type { Props };

export { SwitchButtonD, HorizentalD, VerticalD, Flow };
