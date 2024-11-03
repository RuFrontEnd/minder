import { MouseEventHandler, ReactNode } from "react";
import * as CommonTypes from "@/types/common";

enum Size {
  md = "md",
  sm = "sm",
}

type Props = {
  id?: string;
  className?: string;
  text: ReactNode;
  loading?: boolean;
  vice?: boolean;
  info?: boolean;
  disabled?: boolean;
  danger?: boolean;
  size?: Size;
  status?: CommonTypes.DataStatus;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export type { Props };
export { Size };
