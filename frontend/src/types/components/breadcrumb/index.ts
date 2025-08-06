type Props = {
  id?: string;
  className?: string;
  paths: {
    content: string | React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  }[];
  ellipsis?: {
    enabled: boolean;
    maxLength: number;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
  };
};

export type { Props };
