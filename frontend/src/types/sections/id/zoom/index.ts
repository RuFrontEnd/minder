type Props = {
  zoom: (
    delta: number,
    client: {
      x: number;
      y: number;
    }
  ) => void;
  scale: number;
};

export type { Props };
