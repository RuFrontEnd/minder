import Core from "@/shapes/core";
import Termainal from "@/shapes/terminal";
import Process from "@/shapes/process";
import DataShape from "@/shapes/data";
import Decision from "@/shapes/decision";
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

enum ShapeType {
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

type ConnectionCurves = {
  shape: Curve;
  from: {
    shape: Termainal | Process | DataShape | Decision;
    d: Direction;
  };
  to: {
    shape: Termainal | Process | DataShape | Decision;
    d: Direction;
  };
}[];

type UploadJSON = {
  project: string;
  shapes: {
    id: string;
    type: ShapeType;
    title: string;
    p: {
      x: number;
      y: number;
    };
    size: {
      w: number;
      h: number;
    };
    data: {
      import: Data[];
      using: Data[];
      delete: Data[];
    };
  }[];
  curves: {
    from: {
      d: Direction;
      shapeId: string;
    };
    shape: {
      id: string;
      p1: Vec;
      cp1: Vec;
      cp2: Vec;
      p2: Vec;
    };
    to: {
      d: Direction;
      shapeId: string;
    };
  }[];
};

export type {
  Id,
  W,
  H,
  C,
  Vec,
  Shapes,
  Title,
  Data,
  Datas,
  ConnectionCurves,
  UploadJSON,
};
export { Direction, Corner, ShapeType, SelectAreaTarget, Action, DataStatus };
