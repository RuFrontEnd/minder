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

type PressingSelection = {
  selection: Selection;
  ghost: Selection;
  target: SelectionTypes.PressingTarget;
};

type PressingCurve = {
  from: {
    shape: Terminal | Process | Data | Desicion;
    origin: Terminal | Process | Data | Desicion;
    d: CommonTypes.Direction;
  };
  to: null | {
    shape: Terminal | Process | Data | Desicion;
    origin: Terminal | Process | Data | Desicion;
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
  shapes: (Terminal | Process | Data | Desicion)[];
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

export type {
  PressingSelection,
  PressingCurve,
  Sticking,
  Actions,
  MultiSelectShapeIds,
  Datas,
};

export { OverallType };
