import { ReactNode } from "react";
import * as CharkaDialogTypes from "@chakra-ui/react/dialog";
import * as RoundButtonTypes from "@/types/components/roundButton";

type Props = {
  id?: string;
  className?: string;
  style?: Object;
  title?: ReactNode;
  open?: CharkaDialogTypes.Dialog.RootProps["open"];
  isOpen: boolean;
  children?: ReactNode;
  width?: string;
  zIndex?: string;
  mask?: boolean;
  placement?: CharkaDialogTypes.Dialog.RootProps["placement"];
  closeTrigger?: boolean;
  footer?: {
    ok: () => void;
    cancel: () => void;
  };
  onClickX?: RoundButtonTypes.Props["onClick"];
};

export type { Props };
