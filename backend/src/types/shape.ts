enum Type {
  terminator = "terminator",
  process = "process",
  data = "data",
  decision = "decision",
}

enum Direction {
  l = "l",
  t = "t",
  r = "r",
  b = "b",
}

type ShapeId = string;

type Title = string;

type Vec = { x: number; y: number };

type W = number;

type H = number;

type CurveInfo = {
  p1: {
    x: Vec["x"];
    y: Vec["y"];
  };
  p2: {
    x: Vec["x"];
    y: Vec["y"];
  };
  cp1: {
    x: Vec["x"];
    y: Vec["y"];
  };
  cp2: {
    x: Vec["x"];
    y: Vec["y"];
  };
  sendTo: null | {
    id: ShapeId;
    d: Direction;
  };
  text: null | string;
};

type ShapeData = {
  projectId: number;
  orders: string[];
  shapes: {
    [shapeId: ShapeId]: {
      w: number;
      h: number;
      title: string;
      type: string;
      p: {
        x: number;
        y: number;
      };
      curves: {
        l: ShapeId[];
        t: ShapeId[];
        r: ShapeId[];
        b: ShapeId[];
      };
      data: ShapeId[];
      selectedData: ShapeId[];
    };
  };
  curves: {
    [curveId: ShapeId]: CurveInfo;
  };
  data: {
    [stringId: ShapeId]: string;
  };
};

type GetShapes = {
  res: {
    data: ShapeData;
  };
};

type CreateShapes = {
  req: {
    data: ShapeData;
  };
};

export { Type, Direction };
export type { ShapeId, Title, Vec, W, H, CurveInfo, GetShapes, CreateShapes };
