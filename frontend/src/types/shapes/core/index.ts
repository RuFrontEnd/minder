import Core from "@/shapes/core";
import Curve from "@/shapes/curve";
import { Vec, Direction } from "@/types/shapes/common";

enum PressingTarget {
  // anchor points
  m = "m",
  lt = "lt",
  rt = "rt",
  rb = "rb",
  lb = "lb",
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
    direction: Direction;
    shape: Curve;
  };
};

type ConnectTarget = {
  curve: Curve;
  shape: Core;
  direction: Direction;
};

type CurveOffset = {
  l: Vec;
  t: Vec;
  r: Vec;
  b: Vec;
};

type ReceivePoint = {
  l: { visible: boolean; activate: boolean };
  t: { visible: boolean; activate: boolean };
  r: { visible: boolean; activate: boolean };
  b: { visible: boolean; activate: boolean };
};

type SendTo = {
  shape: Core;
  d: Direction;
  bridgeId: string;
};

type SendCurve = {
  shape: Curve;
  sendTo: null | SendTo;
};

type ReceiveFrom = {
  shape: Core;
  d: Direction;
  bridgeId: string;
};

enum Status {
  normal = "normal",
  disabled = "disabled",
  error = "error",
}

export { PressingTarget, Status };
export type {
  ConncetionTarget,
  ReceivingTarget,
  ConnectTarget,
  Direction,
  CurveOffset,
  ReceivePoint,
  SendTo,
  SendCurve,
  ReceiveFrom,
};
