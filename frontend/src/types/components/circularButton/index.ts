import { MouseEventHandler, ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  style?: Object;
  content?: ReactNode;
  size?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export type { Props };
