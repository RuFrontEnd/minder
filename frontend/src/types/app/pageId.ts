import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import Curve from "@/shapes/curve";
import Stack from "@/dataStructure/stack";
import * as CommonTypes from "@/types/common";
import * as CoreTypes from "@/types/shapes/core";
import * as CurveTypes from "@/types/shapes/curve";

type Pressing = null | {
  origin: null | Terminal | Process | Data | Desicion;
  shape: null | Terminal | Process | Data | Desicion;
  ghost: null | Terminal | Process | Data | Desicion;
  curveId?: null | CurveTypes.Id;
  direction: null | CommonTypes.Direction; // TODO: should be removed in the future
  target:
    | null
    | CoreTypes.PressingTarget
    | CurveTypes.PressingTarget
    | CommonTypes.SelectAreaTarget;
};

type PressingCurve = null | {
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

type Curves = {
  shape: Curve;
  from: {
    shape: Terminal | Process | Data | Desicion;
    d: CommonTypes.Direction;
  };
  to: {
    shape: Terminal | Process | Data | Desicion;
    d: CommonTypes.Direction;
  };
}[];

type MultiSelectShapeIds = string[];

// type ActionTarget = {
//   id: string;
//   index: number;
//   origin: null | Terminal | Process | Data | Desicion | Curve;
// }; // TODO: temp close

// type ActionTargets = ActionTarget[];

// type ActionDeleteTarget = {
//   shape:Terminal | Process | Data| Desicion
//   i:number
//   curves:{
//     shape:Curves[number],
//     i:number
//   }[]
// } // TODO: temp close

// type ActionTypes =
//   | {
//       type: CommonTypes.Action.add;
//     }
//   | {
//       type: CommonTypes.Action.delete;
//       target:ActionDeleteTarget,
//     }
//   | {
//       type: CommonTypes.Action.move;
//       target: Terminal | Process | Data | Desicion;
//       displacement: CommonTypes.Vec;
//     }
//   | {
//       type: CommonTypes.Action.connect;
//     }
//   | {
//       type: CommonTypes.Action.disconnect;
//       curve: Curves[number];
//     }; // TODO: temp close

// type Actions = Stack<ActionTypes>; // TODO: temp close

type Actions = Stack<{
  type: CommonTypes.Action;
  shapes: (Terminal | Process | Data | Desicion)[];
  curves: Curves;
}>;

enum OverallType {
  step = "step",
  data = "data",
}

export type {
  Pressing,
  PressingCurve,
  Sticking,
  // ActionTypes,
  // ActionTarget,
  // ActionDeleteTarget,
  // ActionTargets,
  Actions,
  Curves,
  MultiSelectShapeIds,
};

export { OverallType };
