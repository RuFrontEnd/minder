import { CSSProperties, ReactNode } from "react";

type Props = {
  key?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  name?: string;
  email?: string;
  src?: string;
  fallback?: ReactNode;
  size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  shape?: "full" | "rounded" | "square";
};

export type { Props };
