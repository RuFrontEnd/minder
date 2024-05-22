import { MouseEventHandler, ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  style?: Object;
  isOpen: boolean;
  children?: ReactNode;
  width?: string;
  zIndex?: string;
  onClickX?: MouseEventHandler<HTMLDivElement>;
};

export type { Props };
