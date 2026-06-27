import React, { MouseEventHandler, ReactNode } from "react";
import type { InteractOutsideEvent } from "@zag-js/interact-outside";

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
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  modal?: boolean;
  title?: React.ReactNode | string;
  placement?: "start" | "end" | "top" | "bottom";
  flow?: Flow;
  switchButtonD?: SwitchButtonD;
  children?: ReactNode;
  onClickSwitch?: MouseEventHandler<HTMLButtonElement>;
  onInteractOutside?: (event: InteractOutsideEvent) => void;
  onCancel?: MouseEventHandler<HTMLButtonElement>;
};

export type { Props };

export { SwitchButtonD, HorizentalD, VerticalD, Flow };
