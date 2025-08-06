type Props = {
  id?: number | string;
  className?: string;
  text?: string | React.ReactNode;
  selected?: boolean;
  src?: string;
  onClick?: (id?: number | string) => void;
};

export type { Props };
