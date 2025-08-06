enum Size {
  md = "md",
  sm = "sm",
}

type Props = {
  id?: string;
  className?: string;
  role?: string;
  text: React.ReactNode;
  loading?: boolean;
  vice?: boolean;
  info?: boolean;
  disabled?: boolean;
  danger?: boolean;
  size?: Size;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

export type { Props };
export { Size };
