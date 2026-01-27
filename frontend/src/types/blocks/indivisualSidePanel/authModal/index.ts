import { CSSProperties } from "react";
import * as ModalTypes from "@/types/components/modal";

type Props = {
  style?: CSSProperties;
  className?: string;
  isOpen: boolean;
  onClickX: ModalTypes.Props["onClickX"];
  afterLogin: () => void;
};

export type { Props };
