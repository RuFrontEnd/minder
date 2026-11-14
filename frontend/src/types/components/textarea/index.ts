import {
  ChangeEventHandler,
  KeyboardEventHandler,
} from "react";

type Props = {
  id?: string;
  className?: string;
  role?: string;
  name?: string;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
  value?: undefined | null | string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
};

export type { Props };