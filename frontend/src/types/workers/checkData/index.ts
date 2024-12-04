import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";

type CanUseDatas = { [text: string]: boolean };
type RecordDatas = { [text: string]: Set<string> };

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
  title: string;
  id: string;
  index: number;
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
    canUse: CanUseDatas;
  };
  records: {
    gottenBy: RecordDatas;
    removedBy: RecordDatas;
  };
};

type Steps = {
  [stepId: string]: Step;
};

type CheckPointSteps = ({
  id: string;
} & Step)[];

type MissingDatas = { stepId: string; index: number; data: string }[];

type Visited = { [stepId: string]: boolean };

type TypeMessage = {
  shape: {
    id: string;
    i: number;
  };
  data: {
    id: string;
    i: number;
    text: string;
    status: CommonTypes.DataStatus;
  };
  console: {
    message: string;
    status: CommonTypes.DataStatus;
  };
};

type TypeMessages = TypeMessage[];

type Message = {
  errors: TypeMessages;
  warnings: TypeMessages;
};

enum MessageType {
  error = "error",
  warning = "warning",
}

export type {
  Shapes,
  EventData,
  Step,
  Steps,
  CheckPointSteps,
  MissingDatas,
  Visited,
  CanUseDatas,
  RecordDatas,
  Message,
  TypeMessage,
  TypeMessages,
};

export { MessageType };
