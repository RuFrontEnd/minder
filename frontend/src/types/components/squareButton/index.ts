enum Part {
  independent = "independent",
  left = "left",
  middle = "middle",
  right = "right",
}

type Props = {
  id?: string;
  className?: string;
  style?: Object;
  role?: string;
  tabIndex?: number;
  content?: React.ReactNode;
  size?: number;
  w?: number;
  h?: number;
  shadow?: boolean;
  part?: Part;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
};

export type { Props };
export { Part };
