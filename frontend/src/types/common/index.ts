import Core from "@/shapes/core";
import Process from "@/shapes/process";
import Curve from "@/shapes/curve";

type Id = string;

type W = number;

type H = number;

type C = string;

type Vec = { x: number; y: number };

type Shapes = Core | Process | Curve;

enum Direction {
  l = "l",
  t = "t",
  r = "r",
  b = "b",
}

enum Corner {
  lt = "lt",
  rt = "rt",
  rb = "rb",
  lb = "lb",
}

type Title = string;

type DataItem = { id: string; text: string };

type Data = DataItem[];

enum Type {
  terminator = "terminator",
  process = "process",
  data = "data",
  decision = "decision",
}

enum SelectAreaTarget {
  m = "m",
  lt = "lt",
  rt = "rt",
  rb = "rb",
  lb = "lb",
}

enum Action {
  add = "add",
  delete = "delete",
  connect = "connect",
  disconnect = "disconnect",
  move = "move",
  resize = "resize",
  multiMove = "multiMove",
  multiResize = "multiResize",
}

export type { Id, W, H, C, Vec, Shapes, Title, DataItem, Data };
export { Direction, Corner, Type, SelectAreaTarget, Action };
