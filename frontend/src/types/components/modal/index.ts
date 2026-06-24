import { MouseEventHandler, ReactNode } from "react";
import * as RoundButtonTypes from "@/types/components/roundButton";

type Props = {
  key?: string;
  id?: string;
  className?: string;
  style?: Object;
  isOpen: boolean;
  title?: string;
  placement: "top" | "center" | "bottom";
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'cover' | 'full';
  zIndex?: string;
  footer?: boolean;
  children?: ReactNode;
  okText?: string;
  cancelText?: string;
  onOk: MouseEventHandler<HTMLButtonElement>;
  onCancel: MouseEventHandler<HTMLButtonElement>;
};

export type { Props };
