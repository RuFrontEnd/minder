import {
  HTMLInputTypeAttribute,
  ChangeEventHandler,
  KeyboardEventHandler,
  ReactNode,
} from "react";

enum Status {
  "normal",
  "warning",
  "error",
}

type Props = {
  id?: string;
  className?: string;
  role?: string;
  label?: HTMLInputTypeAttribute;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  name?: string;
  hideLabel?: boolean;
  helperText?: string;
  labelExtra?: ReactNode;
  errorText?: string;
  value?: undefined | null | string;
  status?: null | Status;
  comment?: null | string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
};
export { Status };
export type { Props };
