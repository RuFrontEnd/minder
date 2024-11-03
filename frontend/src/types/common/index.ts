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

enum DataStatus {
  default = "default",
  pass = "pass",
  warning = "warning",
  error = "error",
}

type Data = { id: string; text: string; status: DataStatus };

type Datas = Data[];

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

export type { Id, W, H, C, Vec, Shapes, Title, Data, Datas };
export { Direction, Corner, Type, SelectAreaTarget, Action, DataStatus };
