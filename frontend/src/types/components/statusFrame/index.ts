import { Vec, Title, Data } from "@/types/shapes/common";

type Props = {
  id: string;
  key: string;
  coordinate: Vec;
  init?: { title: Title, selection: string };
  status: string,
  options: [string, string];
  onConfirm: (title: Title, selection: string) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export type { Data, Props };
