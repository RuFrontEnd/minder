import { ReactNode } from "react";
import * as CharkaDialogTypes from "@chakra-ui/react/dialog";
import * as RoundButtonTypes from "@/types/components/roundButton";

type Props = {
  id?: string;
  className?: string;
  style?: Object;
  open?: CharkaDialogTypes.Dialog.RootProps["open"];
  isOpen: boolean;
  children?: ReactNode;
  width?: string;
  zIndex?: string;
  mask?: boolean;
  onClickX?: RoundButtonTypes.Props["onClick"];
};

export type { Props };
