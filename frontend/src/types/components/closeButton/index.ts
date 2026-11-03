import { MouseEventHandler } from "react";

type Props = {
  id?: string;
  className?: string;
  ariaLabel: string;
  size?: "2xs" | "xs" | "sm" | "md" | "lg";
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export type { Props };
