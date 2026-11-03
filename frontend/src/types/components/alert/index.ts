import { MouseEventHandler, ReactNode } from "react";

enum Type {
  succeess = "succeess",
  warning = "warning",
  error =  "error",
}

type Props = {
  id?: string;
  className?: string;
  text: string;
  type: Type;
  variant?: "outline" | "solid" | "subtle" | "surface";
};

export { Type };
export type { Props };
