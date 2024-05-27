import * as CommonTypes from "@/types/shapes/common";
import * as DecisionTypes from "@/types/shapes/decision";
import * as ProjectTypes from "@/types/project";

type CurveInfo = {
  p1: {
    x: CommonTypes.Vec["x"];
    y: CommonTypes.Vec["y"];
  };
  p2: {
    x: CommonTypes.Vec["x"];
    y: CommonTypes.Vec["y"];
  };
  cp1: {
    x: CommonTypes.Vec["x"];
    y: CommonTypes.Vec["y"];
  };
  cp2: {
    x: CommonTypes.Vec["x"];
    y: CommonTypes.Vec["y"];
  };
  sendTo: null | {
    id: CommonTypes.Id;
    d: CommonTypes.Direction;
  };
};

type ShapeData = {
  projectId: ProjectTypes.Project["id"];
  orders: string[];
  shapes: {
    [shapeId: CommonTypes.Id]: {
      w: number;
      h: number;
      title: string;
      type: string;
      p: {
        x: number;
        y: number;
      };
      curves: {
        l: CommonTypes.Id[];
        t: CommonTypes.Id[];
        r: CommonTypes.Id[];
        b: CommonTypes.Id[];
      };
      data: CommonTypes.Id[];
      selectedData: CommonTypes.Id[];
      text: null | {
        l: DecisionTypes.Text;
        t: DecisionTypes.Text;
        r: DecisionTypes.Text;
        b: DecisionTypes.Text;
      };
    };
  };
  curves: {
    [curveId: CommonTypes.Id]: CurveInfo;
  };
  data: {
    [stringId: CommonTypes.Id]: string;
  };
};

type GetShapes = {
  resData: ShapeData;
};

type UpdateShapes = {
  data: ShapeData;
};

type DeleteShape = {
  data: {
    id: ProjectTypes.Project["id"];
  };
};

export type { GetShapes, UpdateShapes, DeleteShape };
