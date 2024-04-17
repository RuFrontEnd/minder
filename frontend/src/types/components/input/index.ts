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
  value: undefined | string;
  status?: Status;
  onChange: ChangeEventHandler<HTMLInputElement>;
};
export { Status };
export type { Props };
