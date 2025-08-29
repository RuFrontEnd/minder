import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import Curve from "@/shapes/curve";
import Selection from "@/shapes/selection";
import Stack from "@/dataStructure/stack";
import * as CommonTypes from "@/types/common";
import * as CurveTypes from "@/types/shapes/curve";
import * as SelectionTypes from "@/types/shapes/selection";
import * as InputTypes from "@/types/components/input";

type PressingSelection = {
  selection: Selection;
  ghost: Selection;
  target: SelectionTypes.PressingTarget;
};

type PressingCurve = {
  from: {
    shape: CommonTypes.Shape;
    origin: CommonTypes.Shape;
    d: CommonTypes.Direction;
  };
  to: null | {
    shape: CommonTypes.Shape;
    origin: CommonTypes.Shape;
    d: CommonTypes.Direction;
  };
  shape: Curve;
};

type Sticking = {
  bridgeId: null | CurveTypes.Id;
  from: {
    d: null | CommonTypes.Direction;
    shape: null | Terminal | Process | Data | Desicion;
  };
  to: {
    d: null | CommonTypes.Direction;
    shape: null | Terminal | Process | Data | Desicion;
  };
};

type MultiSelectShapeIds = string[];

type Actions = Stack<{
  type: CommonTypes.Action;
  shapes: CommonTypes.Shape[];
  curves: CommonTypes.ConnectionCurves;
}>;

enum OverallType {
  step = "step",
  data = "data",
}

type Datas = {
  id: string;
  name: string;
}[];

type UpdateShapes = (shapes: CommonTypes.Shapes) => void;

type Positioning = (shapes: CommonTypes.Shape[], p: CommonTypes.Vec) => void;

type Indivisual = null | CommonTypes.Shape;

type ActionRecords = {
  register: (type: CommonTypes.Action) => void;
  interrupt: (type: CommonTypes.Action) => void;
  finish: (type: CommonTypes.Action) => void;
  peekKey: () => string | undefined;
};

type Init = {
  authInfo: {
    account: {
      value: undefined | string;
      status: InputTypes.Status.normal;
      comment: undefined | string;
    };
    password: {
      value: undefined | string;
      status: InputTypes.Status.normal;
      comment: undefined | string;
    };
    email: {
      value: undefined | string;
      status: InputTypes.Status.normal;
      comment: undefined | string;
    };
  };
  offset: { x: 0; y: 0 };
};

type Zoom = (
  shape: CommonTypes.Shape[],
  delta: number,
  client: {
    x: number;
    y: number;
  }
) => void;

type UpdateConnectionCurves = (
  shapes: CommonTypes.Shape[],
  newConectionCurves: CommonTypes.ConnectionCurves
) => void;

export type {
  PressingSelection,
  PressingCurve,
  Sticking,
  Actions,
  MultiSelectShapeIds,
  Datas,
  UpdateShapes,
  Positioning,
  Indivisual,
  ActionRecords,
  Init,
  Zoom,
  UpdateConnectionCurves
};

export { OverallType };
