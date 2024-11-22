import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";

type Shapes = {
  anchor: {
    size: {
      fill: number;
      stroke: number;
    };
  };
  __curveTrigger__: {
    distance: number;
    size: {
      fill: number;
      stroke: number;
    };
  };
  strokeSize: number;
  id: string;
  title: string;
  __w__: number;
  __h__: number;
  __p__: {
    x: number;
    y: number;
  };
  c: string;
  __selecting__: boolean;
  __receivePoint__: {
    l: {
      visible: boolean;
      activate: boolean;
    };
    t: {
      visible: boolean;
      activate: boolean;
    };
    r: {
      visible: boolean;
      activate: boolean;
    };
    b: {
      visible: boolean;
      activate: boolean;
    };
  };
  __importDatas__: CommonTypes.Datas;
  __usingDatas__: CommonTypes.Datas;
  __deleteDatas__: CommonTypes.Datas;
  status: string;
  __minCurveHandlerDistance__: number;
  __isStart__: boolean;
  isFrameOpen: boolean;
  thersholdRatio: number;
}[];

type EventData = {
  shapes: Shapes;
  curves: CommonTypes.ConnectionCurves;
  done: boolean;
};

type Step = {
  id: string;
  from: {
    l: string[];
    t: string[];
    r: string[];
    b: string[];
  };
  to: {
    l: string[];
    t: string[];
    r: string[];
    b: string[];
  };
  datas: {
    import: CommonTypes.Datas;
    using: CommonTypes.Datas;
    delete: CommonTypes.Datas;
  };
};

type Steps = {
  [stepId: string]: Step;
};

type CheckPointSteps = ({
  id: string;
} & Step)[];

type MissingDatas = { stepId: string; data: string }[];

type Visited = { [stepId: string]: boolean };

export type {
  Shapes,
  EventData,
  Step,
  Steps,
  CheckPointSteps,
  MissingDatas,
  Visited,
};
