import { MouseEventHandler, ReactNode } from "react";
import * as ProjectTypes from "@/types/project";

type Props = {
  id?: number | string;
  className?: string;
  text?: string | ReactNode;
  selected?: boolean;
  onClick?: (id?: number | string) => void;
};

export type { Props };
