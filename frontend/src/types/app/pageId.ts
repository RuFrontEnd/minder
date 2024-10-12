import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";
import * as CoreTypes from "@/types/shapes/core";
import * as CurveTypes from "@/types/shapes/curve";

type Pressing = {
  shape: null | Terminal | Process | Data | Desicion;
  curveId?: null | CurveTypes.Id;
  direction: null | CommonTypes.Direction; // TODO: should be removed in the future
  target:
    | null
    | CoreTypes.PressingTarget
    | CurveTypes.PressingTarget
    | CommonTypes.SelectAreaTarget;
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

export type { Pressing, Sticking };
