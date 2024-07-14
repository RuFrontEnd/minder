type Id = number;
type Name = string;

type Row = { id: number; user: number; name: Name };
type Rows = Row[];

enum Direction {
  l = "l",
  t = "t",
  r = "r",
  b = "b",
}

type ShapeId = string;

type Data = { id: string; text: string };

type Vec = { x: number; y: number };

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

type ProjectData = {
  projectId: number;
  orders: string[];
  shapes: {
    [shapeId: ShapeId]: {
      w: number;
      h: number;
      title: string;
      type: string;
      p: Vec;
      curves: {
        l: ShapeId[];
        t: ShapeId[];
        r: ShapeId[];
        b: ShapeId[];
      };
      data: Data["id"][];
      selectedData: Data["id"][];
      deletedData: Data["id"][];
    };
  };
  curves: {
    [curveId: ShapeId]: CurveInfo;
  };
  data: {
    [stringId: Data["id"]]: string;
  };
  img: string;
};

type UpdateProject = {
  req: {
    data: Omit<ProjectData, "projectId">;
  };
};

type UpdateProjectName = {
  req: {
    data: Name;
  };
};

export type {
  Id,
  Row,
  Rows,
  Direction,
  ShapeId,
  Data,
  Vec,
  CurveInfo,
  ProjectData,
  UpdateProject,
  UpdateProjectName,
};
