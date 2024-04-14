import { MouseEventHandler, ReactNode } from 'react'

type Props = {
  id?: string;
  className?: string;
  text: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>
};

export type { Props };
