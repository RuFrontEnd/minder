import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import Curve from "@/shapes/curve";
import Selection from "@/shapes/selection";
import Stack from "@/dataStructure/stack";
import * as CommonTypes from "@/types/common";
import * as CoreTypes from "@/types/shapes/core";
import * as CurveTypes from "@/types/shapes/curve";
import * as SelectionTypes from "@/types/shapes/selection";
import * as InputTypes from "@/types/components/input";

type PressingSelection = null | {
  selection: Selection;
  ghost: Selection;
  target: SelectionTypes.PressingTarget;
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
  // ActionTypes,
  // ActionTarget,
  // ActionDeleteTarget,
  // ActionTargets,
  Actions,
  MultiSelectShapeIds,
  Datas,
};

export { OverallType };
