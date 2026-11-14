type Option = {
  label: string;
  value: string;
  src?: string;
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