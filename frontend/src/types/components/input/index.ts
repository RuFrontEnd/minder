import { HTMLInputTypeAttribute, ChangeEventHandler } from "react";

enum Status {
  "normal",
  "warning",
  "error",
}

type Props = {
  id?: string;
  className?: string;
  label?: HTMLInputTypeAttribute;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  name?: string;
  w?: string | number;
  h?: string | number;
  value?: undefined | null | string;
  status?: null | Status;
  comment?: null | string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};
export { Status };
export type { Props };
