import { Vec, Title, Data } from "@/types/shapes/common";

type Props = {
  id: string;
  key: string;
  coordinate: Vec;
  onConfirm: (title: Title) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  init?: { title: Title };
};

export type { Data, Props };
