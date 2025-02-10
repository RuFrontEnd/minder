import { MouseEventHandler, ReactNode } from "react";

enum Size {
  md = "md",
  sm = "sm",
}

type Props = {
  id?: string;
  className?: string;
  role?: string;
  text: ReactNode;
  loading?: boolean;
  vice?: boolean;
  info?: boolean;
  disabled?: boolean;
  danger?: boolean;
  size?: Size;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export type { Props };
export { Size };
