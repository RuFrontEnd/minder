import { MouseEventHandler } from 'react'

type Props = {
  id?: string;
  className?: string;
  text: string;
  onClick: MouseEventHandler<HTMLButtonElement>
};

export type { Props };
