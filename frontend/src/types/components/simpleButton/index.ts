enum Size {
  sm = "sm",
  md = "md",
  lg = "lg",
}

type Props = {
  id?: string;
  className?: string;
  role?: string;
  text: React.ReactNode;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

export { Size };
export type { Props };
