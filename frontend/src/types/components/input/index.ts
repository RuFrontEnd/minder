import { HTMLInputTypeAttribute, ChangeEventHandler, ReactNode } from 'react'

type Props = {
  id?: string;
  className?: string;
  label?: HTMLInputTypeAttribute;
  type?: HTMLInputTypeAttribute;
  name?: string;
  value: undefined | string;
  onChange: ChangeEventHandler<HTMLInputElement>
};

export type { Props };
