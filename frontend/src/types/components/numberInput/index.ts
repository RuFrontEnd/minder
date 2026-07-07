type Props = {
  id?: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  width?: string | number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: string) => void;
};

export type { Props };
