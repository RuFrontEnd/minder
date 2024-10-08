import { KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  style?: Object;
  tabIndex?: number;
  content?: ReactNode;
  size?: number;
  outerRing?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
};

export type { Props };
