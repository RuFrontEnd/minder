enum Type {
  terminator = "terminator",
  process = "process",
  data = "data",
  decision = "decision",
}
type ShapeId = string;
type Title = string;
type Vec = { x: number; y: number };
type W = number;
type H = number;
type CurveD = {
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
  sendTo: ShapeId;
  text: null | string;
};
type CreateShapesData = {
  projectId: number;
  shapes: {
    [shapeId: string]: {
      order: number;
      w: number;
      h: number;
      title: string;
      type: string;
      p: {
        x: number;
        y: number;
      };
      data: string[];
      selectedData: { [dataId: string]: boolean };
    };
  };
  curves: {
    [shapeId: string]: {
      [direction: string]: {
        id: string;
        p1: {
          x: number;
          y: number;
        };
        p2: {
          x: number;
          y: number;
        };
        cp1: {
          x: number;
          y: number;
        };
        cp2: {
          x: number;
          y: number;
        };
        sendTo: {
          id: string;
          d: string;
        };
      }[];
    };
  };
  data: {
    [stringId: string]: string;
  };
};

export { Type };
export type { ShapeId, Title, Vec, W, H, CurveD, CreateShapesData };
