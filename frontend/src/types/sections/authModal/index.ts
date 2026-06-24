import React, { CSSProperties, MouseEventHandler } from "react";
import * as ModalTypes from "@/types/components/modal";

type Props = {
  style?: CSSProperties;
  className?: string;
  isOpen: boolean;
  isLogIn: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  onCancel: MouseEventHandler<HTMLButtonElement>
  afterLogin: () => void;
  afterLogout: () => void;
};

export type { Props };
