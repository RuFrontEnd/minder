import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import DataShape from "@/shapes/data";
import Decision from "@/shapes/decision";
// import Procedure from "@/shapes/procedure"; // TODO: for shape types
import Curve from "@/shapes/curve";
import * as CommonTypes from "@/types/common";

type Id = string;

type W = number;

type H = number;

type C = string;

type Vec = { x: number; y: number };

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

enum ConsoleStatus {
  warning = "warning",
  error = "error",
}

type Data = { id: string; text: string; status: DataStatus };

type Datas = Data[];

type OverallData = { id: string; name: string };

type OverallDatas = OverallData[];

enum ShapeType {
  terminator = "terminator",
  process = "process",
  data = "data",
  decision = "decision",
  procedure = "procedure",
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
    shape: Terminal | Process | DataShape | Decision;
    d: Direction;
  };
  to: {
    shape: Terminal | Process | DataShape | Decision;
    d: Direction;
  };
}[];

type UploadJSON = {
  project: string;
  shapes: {
    id: string;
    type: Exclude<ShapeType, ShapeType.procedure>;
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
      text: string;
    };
    to: {
      d: Direction;
      shapeId: string;
    };
  }[];
  datas: CommonTypes.OverallDatas;
  consoles: any;
};

type Shape = Terminal | Process | DataShape | Decision;

type Shapes = Shape[];

type Steps = CommonTypes.Shapes;

type ProjectName = { val: string; inputVal: string };

export type {
  Id,
  W,
  H,
  C,
  Vec,
  Title,
  Data,
  Datas,
  OverallData,
  OverallDatas,
  ConnectionCurves,
  UploadJSON,
  Shape,
  Shapes,
  Steps,
  ProjectName,
};
export { Direction, Corner, ShapeType, Action, DataStatus, ConsoleStatus };
