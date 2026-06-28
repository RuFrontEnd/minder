type Item = {
  label: string;
  value: string;
  logo?: string;
};

type Props = {
  id?: string;
  className?: string;
  placeholder?: string;
  label?: string;
  width?: string | number;
  multiple?: boolean;
  closeOnSelect?: boolean;
  value?: string[];
  showSelectedItems?: boolean;
  emptyText?: string;
  items: Item[];
  onValueChange?: (value: string[]) => void;
};

export type { Item, Props };
