import { MouseEventHandler, ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  text: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export type { Props };
