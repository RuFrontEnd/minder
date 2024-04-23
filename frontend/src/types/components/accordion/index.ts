type Props = {
  className?: string;
  title: React.ReactNode;
  open: boolean;
  children: React.ReactNode;
  hoverRender?: React.ReactNode;
  showArrow?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export type { Props };
