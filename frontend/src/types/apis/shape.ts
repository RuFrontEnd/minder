type Data = {
  id: string;
  text: string;
  status: string;
};

type UpsertData = {
  id: string;
  title: string;
  w: number;
  h: number;
  p: {
    x: number;
    y: number;
  };
  importDatas: Data[];
  usingDatas: Data[];
  deleteDatas: Data[];
  type: string;
};

type Point = {
  x: number;
  y: number;
};

type CurveEnd = {
  d: string;
  shapeId: string;
};

type CurveShape = {
  id: string;
  p1: Point;
  cp1: Point;
  cp2: Point;
  p2: Point;
  text: string;
};

type CurveData = {
  from: CurveEnd;
  shape: CurveShape;
  to: CurveEnd;
};

type UpsertRequest = {
  shapes: UpsertData[];
  curves: CurveData[];
};

export type { Data, UpsertData, CurveData, Point, CurveEnd, CurveShape, UpsertRequest };
