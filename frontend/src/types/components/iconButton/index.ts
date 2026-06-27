import { MouseEventHandler, ReactNode } from "react";

type Props = {
  key?: string;
  id?: string;
  className?: string;
  role?: string;
  ariaLabel: string;
  icon: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "solid" | "subtle" | "surface" | "outline" | "ghost" | "plain";
  style?: React.CSSProperties;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export type { Props };
