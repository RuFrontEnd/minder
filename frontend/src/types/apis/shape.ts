import * as CommonTypes from "@/types/shapes/common";

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
  sendTo: {
    id: CommonTypes.Id;
    d: CommonTypes.Direction;
  };
  text: null | string;
};

type GetShapes = {
  ResData: {
    projectId: number;
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
      };
    };
    curves: {
      [curveId: CommonTypes.Id]: CurveInfo;
    };
    data: {
      [stringId: CommonTypes.Id]: string;
    };
  };
};

export type { GetShapes };
