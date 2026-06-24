import { CSSProperties } from "react";
import * as ModalTypes from "@/types/components/modal";

type Props = {
  style?: CSSProperties;
  className?: string;
  isOpen: boolean;
  isLogIn: boolean;
  afterLogin: () => void;
  afterLogout: () => void;
};

export type { Props };
