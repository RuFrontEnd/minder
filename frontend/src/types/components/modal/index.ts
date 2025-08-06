import * as RoundButtonTypes from "@/types/components/roundButton";

type Props = {
  id?: string;
  className?: string;
  style?: Object;
  isOpen: boolean;
  children?: React.ReactNode;
  width?: string;
  zIndex?: string;
  mask?: boolean;
  onClickX?: RoundButtonTypes.Props['onClick'];
};

export type { Props };
