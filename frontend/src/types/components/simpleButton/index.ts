import { MouseEventHandler, ReactNode } from "react";

enum Size {
  sm = "sm",
  md = "md",
  lg = "lg",
}

type Props = {
  id?: string;
  className?: string;
  text: ReactNode;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export { Size };
export type { Props };
