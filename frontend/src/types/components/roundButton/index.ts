type Props = {
  id?: string;
  className?: string;
  style?: Object;
  tabIndex?: number;
  content?: React.ReactNode;
  size?: number;
  outerRing?: boolean;
  differece?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
};

export type { Props };
