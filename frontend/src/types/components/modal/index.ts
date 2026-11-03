import { MouseEventHandler, ReactNode } from "react";

type Props = {
  key?: string;
  id?: string;
  className?: string;
  bodyClassName?: string;
  backdropClassName?: string;
  positionerClassName?: string;
  style?: React.CSSProperties;
  isOpen: boolean;
  title?: string;
  placement: "top" | "center" | "bottom";
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'cover' | 'full';
  zIndex?: string;
  footer?: boolean;
  children?: ReactNode;
  okText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  onOk?: MouseEventHandler<HTMLButtonElement>;
  onCancel?: MouseEventHandler<HTMLButtonElement>;
  onClose?: () => void;
};

export type { Props };
