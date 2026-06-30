import { MouseEventHandler, ReactNode } from "react";

type Props = {
  key?: string;
  id?: string;
  className?: string;
  role?: string;
  color?: string;
  text: ReactNode;
  loading?: boolean;
  vice?: boolean;
  info?: boolean;
  disabled?: boolean;
  danger?: boolean;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain';
  style?: React.CSSProperties;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export type { Props };
