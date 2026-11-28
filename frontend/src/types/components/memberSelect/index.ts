import { CSSProperties } from "react";

type Option = {
  label: string;
  value: string;
  src?: string;
  avatarStyle?: CSSProperties;
};

type Props = {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  showLabel?: boolean;
  avatarSize?: "2xs" | "xs";
  ariaLabel?: string;
};

export type { Option, Props };