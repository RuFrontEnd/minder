import Core from "@/shapes/core";
import Curve from "@/shapes/curve";
import * as CommonTypes from "@/types/common";

enum PressingTarget {
  // anchor points
  m = "m",
  lt = CommonTypes.Corner.lt,
  rt = CommonTypes.Corner.rt,
  rb = CommonTypes.Corner.rb,
  lb = CommonTypes.Corner.lb,
  // l curve control points
  clp1 = "clp1",
  clcp1 = "clcp1",
  clcp2 = "clcp2",
  clp2 = "clp2",
  // t curve control points
  ctp1 = "ctp1",
  ctcp1 = "ctcp1",
  ctcp2 = "ctcp2",
  ctp2 = "ctp2",
  // r curve control points
  crp1 = "crp1",
  crcp1 = "crcp1",
  crcp2 = "crcp2",
  crp2 = "crp2",
  // b curve control points
  cbp1 = "cbp1",
  cbcp1 = "cbcp1",
  cbcp2 = "cbcp2",
  cbp2 = "cbp2",
}

type ConncetionTarget = null | {
  shape: Core;
  curve: null | Curve;
};

type ReceivingTarget = {
  shape: Core;
  curve: {
    direction: CommonTypes.Direction;
    shape: Curve;
  };
};

type ConnectTarget = {
  curve: Curve;
  shape: Core;
  direction: CommonTypes.Direction;
};

type CurveOffset = {
  l: CommonTypes.Vec;
  t: CommonTypes.Vec;
  r: CommonTypes.Vec;
  b: CommonTypes.Vec;
};

type ReceivePoint = {
  l: { visible: boolean; activate: boolean };
  t: { visible: boolean; activate: boolean };
  r: { visible: boolean; activate: boolean };
  b: { visible: boolean; activate: boolean };
};

type SendTo = {
  shape: Core;
  d: CommonTypes.Direction;
  bridgeId: string;
};

type SendCurve = {
  shape: Curve;
  sendTo: null | SendTo;
};

type ReceiveFrom = {
  shape: Core;
  d: CommonTypes.Direction;
  bridgeId: string;
};

enum Status {
  normal = "normal",
  disabled = "disabled",
  error = "error",
}

type GetCenterReturn = {
  m: CommonTypes.Vec;
  [CommonTypes.Direction.l]: CommonTypes.Vec;
  [CommonTypes.Direction.t]: CommonTypes.Vec;
  [CommonTypes.Direction.r]: CommonTypes.Vec;
  [CommonTypes.Direction.b]: CommonTypes.Vec;
  [CommonTypes.Corner.lt]: CommonTypes.Vec;
  [CommonTypes.Corner.rt]: CommonTypes.Vec;
  [CommonTypes.Corner.rb]: CommonTypes.Vec;
  [CommonTypes.Corner.lb]: CommonTypes.Vec;
  __curveTrigger__: {
    l: CommonTypes.Vec;
    t: CommonTypes.Vec;
    r: CommonTypes.Vec;
    b: CommonTypes.Vec;
  };
  receivingPoints: {
    l: CommonTypes.Vec;
    t: CommonTypes.Vec;
    r: CommonTypes.Vec;
    b: CommonTypes.Vec;
  };
};

export { PressingTarget, Status };
export type {
  ConncetionTarget,
  ReceivingTarget,
  ConnectTarget,
  CurveOffset,
  ReceivePoint,
  SendTo,
  SendCurve,
  ReceiveFrom,
  GetCenterReturn,
};
