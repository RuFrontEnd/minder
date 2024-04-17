import { MouseEventHandler, ReactNode } from "react";

enum Type {
  "succeess",
  "warning",
  "error",
}

type Props = {
  id?: string;
  className?: string;
  text: string;
  type: Type;
};

export { Type };
export type { Props };
