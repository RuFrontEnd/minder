type Id = string;

type Line = {
  w: number;
  c: string;
};

enum PressingTarget {
  p1 = "p1",
  cp1 = "cp1",
  p2 = "p2",
  cp2 = "cp2",
  tipP = "tipP",
}

export { PressingTarget };
export type { Id, Line };
