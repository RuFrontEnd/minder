import { ReactNode } from "react";

export type Props = {
  isOpen: boolean;
  mask?: boolean;
  zIndex?: number | string;
  width?: string;
  onClickX?: () => void;
  children?: ReactNode;
};

export {};
