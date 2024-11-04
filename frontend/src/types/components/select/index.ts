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
  type?: HTMLInputTypeAttribute;
  name?: string;
  placeholder?: string;
  w?: string | number;
  h?: string | number;
  value?: undefined | null | string;
  status?: Status;
  comment?: string;
  options: string[];
  onChange?: ChangeEventHandler<HTMLSelectElement>;
};
export { Status };
export type { Props };
