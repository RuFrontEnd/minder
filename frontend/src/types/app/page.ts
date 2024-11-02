import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CurveTypes from "@/types/shapes/curve";
import * as CommonTypes from "@/types/common";

type Steps = {
  [shapeId: string]: {
    shape: Core;
    open: boolean;
  };
};

type Procedures = { [shapeId: string]: string[] };

type OtherStepIds = string[];

export type { Steps, Procedures, OtherStepIds };
