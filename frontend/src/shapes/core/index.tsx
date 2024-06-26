"use client";
import Curve from "@/shapes/curve";
import { tailwindColors } from "@/variables/colors";
import { Inter } from "next/font/google";
import { Vec, Direction, Data as DataType } from "@/types/shapes/common";
import * as CoreTypes from "@/types/shapes/core";
import * as CommonTypes from "@/types/shapes/common";
import * as CurveTypes from "@/types/shapes/curve";

const inter = Inter({ subsets: ["latin"] });

const ds = [Direction.l, Direction.t, Direction.r, Direction.b];

export default class Core {
  id: string;
  c: string;
  anchor = {
    size: {
      fill: 4,
      stroke: 2,
    },
  };
  curveTrigger: {
    d: number;
    size: {
      fill: number;
      stroke: number;
    };
  } = {
    d: 50,
    size: {
      fill: 4,
      stroke: 2,
    },
  };
  private strokeSize = 1;
  private initOffset = {
    x: 0,
    y: 0,
  };
  private initScale = 1;
  __w__: number;
  __h__: number;
  title: CommonTypes.Title;
  __p__: Vec;
  curves: {
    l: CoreTypes.SendCurve[];
    t: CoreTypes.SendCurve[];
    r: CoreTypes.SendCurve[];
    b: CoreTypes.SendCurve[];
  };
  __selecting__: boolean;
  __receiving__: CoreTypes.Receiving;
  receiveFrom: {
    l: CoreTypes.ReceiveFrom[];
    t: CoreTypes.ReceiveFrom[];
    r: CoreTypes.ReceiveFrom[];
    b: CoreTypes.ReceiveFrom[];
  };
  receiveHighlightOffset: number;
  options: DataType;
  selectedData: DataType;
  deletedData: DataType;
  redundancies: DataType;
  __offset__: Vec;
  __scale__: number;
  status: CoreTypes.Status;

  constructor(
    id: string,
    w: number,
    h: number,
    p: Vec,
    c: string,
    title: CommonTypes.Title
  ) {
    this.id = id;
    this.title = title;
    this.__w__ = w;
    this.__h__ = h;
    this.__p__ = p;
    this.c = c;
    this.curves = {
      l: [],
      t: [],
      r: [],
      b: [],
    };
    this.__selecting__ = false;
    this.__receiving__ = {
      l: { open: false, highlight: false },
      t: { open: false, highlight: false },
      r: { open: false, highlight: false },
      b: { open: false, highlight: false },
    };
    this.receiveFrom = {
      l: [],
      t: [],
      r: [],
      b: [],
    };
    this.options = [];
    this.selectedData = [];
    this.deletedData = [];
    this.redundancies = [];
    this.__offset__ = this.initOffset;
    this.__scale__ = this.initScale;
    this.status = CoreTypes.Status.normal;
    this.receiveHighlightOffset = 4;
  }

  set p(value: Vec) {
    const offest = {
      x: value.x - this.p.x,
      y: value.y - this.p.y,
    };
    this.__p__ = value;

    // when receiver shape move, sender curve follows the receiver shape
    const senderCurvesMapping: { [curveId: string]: boolean } = {};

    const senders = (() => {
      const _senders: CoreTypes.ReceiveFrom[] = [];

      ds.forEach((d) => {
        const senders = this.receiveFrom[d];
        if (!senders) return;
        senders.forEach((sender) => {
          _senders.push(sender);
        });
      });

      return _senders;
    })();

    senders.forEach((sender) => {
      ds.forEach((d) => {
        sender?.shape.curves[d].forEach((sendCurve) => {
          if (
            d === sender.d &&
            sendCurve.sendTo?.shape.id === this.id &&
            !senderCurvesMapping[sendCurve.shape.id]
          ) {
            sendCurve.shape.p2 = {
              x: sendCurve.shape.p2.x + offest.x,
              y: sendCurve.shape.p2.y + offest.y,
            };
            sendCurve.shape.cp2.x += offest.x;
            sendCurve.shape.cp2.y += offest.y;
            senderCurvesMapping[sendCurve.shape.id] = true;
          }
        });
      });
    });

    // when sender shape move, receiver curve follows the sender shape
    ds.forEach((d) => {
      this.curves[d].forEach((sendCurve) => {
        const senderCurve = sendCurve.shape,
          sendToShape = sendCurve.sendTo;

        if (senderCurve && sendToShape) {
          senderCurve.p2 = {
            x: senderCurve.p2.x - offest.x,
            y: senderCurve.p2.y - offest.y,
          };
          senderCurve.cp2.x -= offest.x;
          senderCurve.cp2.y -= offest.y;
        }
      });
    });
  }

  get p() {
    return this.__p__;
  }

  set w(value: number) {
    const offset = (this.w - value) / 2;
    this.__w__ = value;

    // when sender width changes, receiver curve follows the sender shape
    this.curves[Direction.l].forEach((sendCurve) => {
      sendCurve.shape.p1.x += offset;
      sendCurve.shape.cp1.x += offset;

      if (sendCurve.sendTo) return;

      sendCurve.shape.p2 = {
        ...sendCurve.shape.p2,
        x: sendCurve.shape.p2.x + offset,
      };
      sendCurve.shape.cp2.x += offset;
    });

    this.curves[Direction.r].forEach((sendCurve) => {
      sendCurve.shape.p1.x -= offset;
      sendCurve.shape.cp1.x -= offset;

      if (sendCurve.sendTo) return;

      sendCurve.shape.p2 = {
        ...sendCurve.shape.p2,
        x: sendCurve.shape.p2.x - offset,
      };
      sendCurve.shape.cp2.x -= offset;
    });

    // when receiver width changes, receiver curve follows the sender shape

    this.receiveFrom.l?.forEach((receiveFromItem) => {
      const bridge = receiveFromItem.shape.curves[receiveFromItem.d].find(
        (sendCurve) => sendCurve.shape.id === receiveFromItem.bridgeId
      );

      if (!bridge) return;
      bridge.shape.p2 = {
        ...bridge.shape.p2,
        x: bridge.shape.p2.x + offset,
      };
      bridge.shape.cp2.x += offset;
    });

    this.receiveFrom.r?.forEach((receiveFromItem) => {
      const bridge = receiveFromItem.shape.curves[receiveFromItem.d].find(
        (sendCurve) => sendCurve.shape.id === receiveFromItem.bridgeId
      );

      if (!bridge) return;
      bridge.shape.p2 = {
        ...bridge.shape.p2,
        x: bridge.shape.p2.x - offset,
      };
      bridge.shape.cp2.x -= offset;
    });
  }

  get w() {
    return this.__w__;
  }

  set h(value: number) {
    const offset = (this.h - value) / 2;
    this.__h__ = value;

    // when sender height changes, receiver curve follows the sender shape
    this.curves[Direction.t].forEach((sendCurve) => {
      sendCurve.shape.p1.y += offset;
      sendCurve.shape.cp1.y += offset;

      if (sendCurve.sendTo) return;

      sendCurve.shape.p2 = {
        ...sendCurve.shape.p2,
        y: sendCurve.shape.p2.y + offset,
      };
      sendCurve.shape.cp2.y += offset;
    });

    this.curves[Direction.b].forEach((sendCurve) => {
      sendCurve.shape.p1.y -= offset;
      sendCurve.shape.cp1.y -= offset;

      if (sendCurve.sendTo) return;

      sendCurve.shape.p2 = {
        ...sendCurve.shape.p2,
        y: sendCurve.shape.p2.y - offset,
      };
      sendCurve.shape.cp2.y -= offset;
    });

    // when receiver height changes, receiver curve follows the sender shape
    this.receiveFrom.t?.forEach((receiveFromItem) => {
      const bridge = receiveFromItem.shape.curves[receiveFromItem.d].find(
        (sendCurve) => sendCurve.shape.id === receiveFromItem.bridgeId
      );

      if (!bridge) return;
      bridge.shape.p2 = {
        ...bridge.shape.p2,
        y: bridge.shape.p2.y + offset,
      };
      bridge.shape.cp2.y += offset;
    });

    this.receiveFrom.b?.forEach((receiveFromItem) => {
      const bridge = receiveFromItem.shape.curves[receiveFromItem.d].find(
        (sendCurve) => sendCurve.shape.id === receiveFromItem.bridgeId
      );

      if (!bridge) return;
      bridge.shape.p2 = {
        ...bridge.shape.p2,
        y: bridge.shape.p2.y - offset,
      };
      bridge.shape.cp2.y -= offset;
    });
  }

  get h() {
    return this.__h__;
  }

  set offset(value: Vec) {
    this.__offset__ = value;
  }

  get offset() {
    return this.__offset__;
  }

  set scale(value: number) {
    this.__scale__ = value;

    ds.forEach((d) => {
      this.curves[d].forEach((curve) => {
        curve.shape.scale = value;
      });
    });
  }

  get scale() {
    return this.__scale__;
  }

  set selecting(_selecting: boolean) {
    this.__selecting__ = _selecting;
  }

  get selecting() {
    return this.__selecting__;
  }

  set receiving(_receiving: CoreTypes.Receiving) {
    this.__receiving__ = _receiving;
  }

  get receiving() {
    return this.__receiving__;
  }

  getScreenP() {
    return {
      x: (this.p.x + this.offset.x) * this.scale,
      y: (this.p.y + this.offset.y) * this.scale,
    };
  }

  getCurveP(d: CommonTypes.Direction, id: string) {
    const curve = this.curves[d].find((curve) => curve.shape.id === id)?.shape;

    if (!curve) return;

    return {
      normal: {
        cp1: { x: curve.cp1.x + this.p.x, y: curve.cp1.y + this.p.y },
        cp2: {
          x: curve.cp2.x + this.p.x,
          y: curve.cp2.y + this.p.y,
        },
        p2: { x: curve.p2.x + this.p.x, y: curve.p2.y + this.p.y },
      },
      screen: {
        cp1: { x: curve.cp1.x + this.p.x, y: curve.cp1.y + this.p.y },
        cp2: {
          x: curve.cp2.x + this.p.x,
          y: curve.cp2.y + this.p.y,
        },
        p2: { x: curve.p2.x + this.p.x, y: curve.p2.y + this.p.y },
      },
    };
  }

  getScreenSize() {
    return {
      w: this.w * this.scale,
      h: this.h * this.scale,
    };
  }

  getScaleCurveTriggerDistance() {
    return this.curveTrigger.d * this.scale;
  }

  getEdge() {
    return {
      normal: {
        l: this.p.x - this.w / 2,
        t: this.p.y - this.h / 2,
        r: this.p.x + this.w / 2,
        b: this.p.y + this.h / 2,
      },
      screen: {
        l: this.getScreenP().x - this.getScreenSize().w / 2,
        t: this.getScreenP().y - this.getScreenSize().h / 2,
        r: this.getScreenP().x + this.getScreenSize().w / 2,
        b: this.getScreenP().y + this.getScreenSize().h / 2,
      },
    };
  }

  getCenter() {
    const edge = this.getEdge();
    const pivot = {
      normal: {
        x: this.p.x,
        y: this.p.y,
      },
      screen: {
        x: this.getScreenP().x,
        y: this.getScreenP().y,
      },
    };

    return {
      normal: {
        m: pivot.normal,
        lt: {
          x: edge.normal.l,
          y: edge.normal.t,
        },
        rt: {
          x: edge.normal.r,
          y: edge.normal.t,
        },
        rb: {
          x: edge.normal.r,
          y: edge.normal.b,
        },
        lb: {
          x: edge.normal.l,
          y: edge.normal.b,
        },
        curveTrigger: {
          l: {
            x: edge.normal.l - this.curveTrigger.d,
            y: pivot.normal.y,
          },
          t: {
            x: pivot.normal.x,
            y: edge.normal.t - this.curveTrigger.d,
          },
          r: {
            x: edge.normal.r + this.curveTrigger.d,
            y: pivot.normal.y,
          },
          b: {
            x: pivot.normal.x,
            y: edge.normal.b + this.curveTrigger.d,
          },
        },
        receivingPoints: {
          l: {
            x: pivot.normal.x - this.w / 2,
            y: pivot.normal.y,
          },
          t: {
            x: pivot.normal.x,
            y: pivot.normal.y - this.h / 2,
          },
          r: {
            x: pivot.normal.x + this.w / 2,
            y: pivot.normal.y,
          },
          b: {
            x: pivot.normal.x,
            y: pivot.normal.y + this.h / 2,
          },
        },
      },
      screen: {
        m: pivot.screen,
        lt: {
          x: edge.screen.l,
          y: edge.screen.t,
        },
        rt: {
          x: edge.screen.r,
          y: edge.screen.t,
        },
        rb: {
          x: edge.screen.r,
          y: edge.screen.b,
        },
        lb: {
          x: edge.screen.l,
          y: edge.screen.b,
        },
        curveTrigger: {
          l: {
            x: edge.screen.l - this.getScaleCurveTriggerDistance(),
            y: pivot.screen.y,
          },
          t: {
            x: pivot.screen.x,
            y: edge.screen.t - this.getScaleCurveTriggerDistance(),
          },
          r: {
            x: edge.screen.r + this.getScaleCurveTriggerDistance(),
            y: pivot.screen.y,
          },
          b: {
            x: pivot.screen.x,
            y: edge.screen.b + this.getScaleCurveTriggerDistance(),
          },
        },
        receivingPoints: {
          l: {
            x: pivot.screen.x - this.getScreenSize().w / 2,
            y: pivot.screen.y,
          },
          t: {
            x: pivot.screen.x,
            y: pivot.screen.y - this.getScreenSize().h / 2,
          },
          r: {
            x: pivot.screen.x + this.getScreenSize().w / 2,
            y: pivot.screen.y,
          },
          b: {
            x: pivot.screen.x,
            y: pivot.screen.y + this.getScreenSize().h / 2,
          },
        },
      },
    };
  }

  checkBoundry(p: Vec) {
    const edge = this.getEdge();

    return (
      p.x > edge.screen.l - this.anchor.size.fill &&
      p.y > edge.screen.t - this.anchor.size.fill &&
      p.x < edge.screen.r + this.anchor.size.fill &&
      p.y < edge.screen.b + this.anchor.size.fill
    );
  }

  checkVertexesBoundry(p: Vec) {
    const edge = this.getEdge();

    let dx, dy;

    dx = edge.screen.l - p.x;
    dy = edge.screen.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.lt;
    }

    dx = edge.screen.r - p.x;
    dy = edge.screen.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.rt;
    }

    dx = edge.screen.r - p.x;
    dy = edge.screen.b - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.rb;
    }

    dx = edge.screen.l - p.x;
    dy = edge.screen.b - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.lb;
    }

    return null;
  }

  checkCurveBoundry(d: CommonTypes.Direction, id: string, p: Vec) {
    const curve = this.curves[d].find((curve) => curve.shape.id === id)?.shape;

    if (!curve) return;

    return curve.checkBoundry({
      x: p.x - this.getScreenP().x,
      y: p.y - this.getScreenP().y,
    });
  }

  checkCurveControlPointsBoundry(d: CommonTypes.Direction, id: string, p: Vec) {
    const curve = this.curves[d].find((curve) => curve.shape.id === id)?.shape;

    if (!curve) return;

    return curve.checkControlPointsBoundry({
      x: p.x - this.getScreenP().x,
      y: p.y - this.getScreenP().y,
    });
  }

  checkReceivingBoundry(p: Vec) {
    const edge = this.getEdge();

    const receivingBoundryOffset = 75;

    return (
      p.x > edge.screen.l - receivingBoundryOffset &&
      p.y > edge.screen.t - receivingBoundryOffset &&
      p.x < edge.screen.r + receivingBoundryOffset &&
      p.y < edge.screen.b + receivingBoundryOffset
    );
  }

  checkReceivingPointsBoundry(p: Vec) {
    const edge = this.getEdge(),
      center = this.getCenter();

    let dx, dy;

    dx = edge.screen.l - p.x;
    dy = center.screen.m.y - p.y;

    const squaredFillAnchorSize = Math.pow(
      this.anchor.size.fill + this.receiveHighlightOffset,
      2
    );

    if (this.receiving.l.open && dx * dx + dy * dy < squaredFillAnchorSize) {
      return Direction.l;
    }

    dx = center.screen.m.x - p.x;
    dy = edge.screen.t - p.y;

    if (this.receiving.t.open && dx * dx + dy * dy < squaredFillAnchorSize) {
      return Direction.t;
    }

    dx = p.x - edge.screen.r;
    dy = center.screen.m.y - p.y;

    if (this.receiving.r.open && dx * dx + dy * dy < squaredFillAnchorSize) {
      return Direction.r;
    }

    dx = center.screen.m.x - p.x;
    dy = p.y - edge.screen.b;

    if (this.receiving.b.open && dx * dx + dy * dy < squaredFillAnchorSize) {
      return Direction.b;
    }

    return null;
  }

  getCurveTriggerDirection(p: Vec) {
    if (!this.selecting) return null;
    const center = this.getCenter();

    for (const d of ds) {
      if (
        (p.x - center.screen.curveTrigger[d].x) *
          (p.x - center.screen.curveTrigger[d].x) +
          (p.y - center.screen.curveTrigger[d].y) *
            (p.y - center.screen.curveTrigger[d].y) <
        this.curveTrigger.size.fill * this.curveTrigger.size.fill
      ) {
        return Direction[d];
      }
    }
  }

  connect(
    targetShape: Core,
    targetShapeReceiveD: Direction,
    bridgeId: string,
    handleAfterConnect?: (
      bridge: {
        d: CommonTypes.Direction;
        curve: CoreTypes.SendCurve;
      },
      targetShapeReceiveD: CommonTypes.Direction
    ) => void
  ) {
    const bridge = (() => {
      for (const d of ds) {
        const curve = this.curves[d].find(
          (curve) => curve.shape.id === bridgeId
        );
        if (curve)
          return {
            d: d,
            curve: curve,
          };
      }
    })();

    if (!bridge) return;
    bridge.curve.sendTo = {
      shape: targetShape,
      d: targetShapeReceiveD,
      bridgeId: bridgeId,
    };
    targetShape.receiveFrom[targetShapeReceiveD].push({
      shape: this,
      d: bridge.d,
      bridgeId: bridgeId,
    });

    if (handleAfterConnect) {
      return handleAfterConnect(bridge, targetShapeReceiveD);
    }

    if (targetShapeReceiveD === Direction.l) {
      bridge.curve.shape.p2 = {
        x: targetShape.p.x - this.p.x - targetShape.w / 2 - 6,
        y: targetShape.p.y - this.p.y,
      };
    } else if (targetShapeReceiveD === Direction.t) {
      bridge.curve.shape.p2 = {
        x: targetShape.p.x - this.p.x,
        y: targetShape.p.y - this.p.y - targetShape.h / 2 - 6,
      };
    } else if (targetShapeReceiveD === Direction.r) {
      bridge.curve.shape.p2 = {
        x: targetShape.p.x - this.p.x + targetShape.w / 2 + 6,
        y: targetShape.p.y - this.p.y,
      };
    } else if (targetShapeReceiveD === Direction.b) {
      bridge.curve.shape.p2 = {
        x: targetShape.p.x - this.p.x,
        y: targetShape.p.y - this.p.y + targetShape.h / 2 + 6,
      };
    }
  }

  disConnect(shape: Core, curveIds: string[]) {
    const curveIdsMapping = (() => {
      const mapping: { [curveId: string]: boolean } = {};

      curveIds.forEach((curveId) => {
        mapping[curveId] = true;
      });

      return mapping;
    })();

    ds.forEach((d) => {
      this.curves[d].forEach((sendCurve) => {
        if (!(sendCurve.shape.id in curveIdsMapping)) return;

        const receiverShape = sendCurve?.sendTo?.shape,
          receiverShapeD = sendCurve?.sendTo?.d;

        if (receiverShape && receiverShapeD) {
          const disconnectReceiveI = receiverShape.receiveFrom[
            receiverShapeD
          ].findIndex((receiveFrom) => receiveFrom.shape.id === this.id);
          receiverShape.receiveFrom[receiverShapeD].splice(
            disconnectReceiveI,
            1
          );
          sendCurve.sendTo = null;
        }
      });
    });
  }

  removeConnection() {
    // remove connection from receiver
    ds.forEach((d) => {
      this.curves[d].forEach((sendCurve) => {
        const sendTo = sendCurve.sendTo;
        if (!sendTo) return;

        const removeTargetI = sendTo.shape.receiveFrom[sendTo.d].findIndex(
          (receiveFrom) => receiveFrom.shape.id === this.id
        );

        sendTo.shape.receiveFrom[sendTo.d].splice(removeTargetI, 1);
      });
    });
    // remove connection from sender
    ds.forEach((d) => {
      const senders = this.receiveFrom[d];
      if (!senders) return;

      ds.forEach((d) => {
        senders.forEach((sender) => {
          sender.shape.curves[d].forEach((curve) => {
            if (curve.sendTo?.shape.id === this.id) {
              curve.sendTo = null;
            }
          });
        });
      });
    });
  }

  getRedundancies() {
    this.status = CoreTypes.Status.normal;
    this.redundancies = [];

    let optionsHash: { [text: string]: boolean } = {};

    this.options.forEach((option) => {
      optionsHash[option.text] = true;
    });

    this.selectedData.forEach((dataItem) => {
      if (!optionsHash[dataItem.text]) {
        this.redundancies.push(dataItem);
      }
    });

    this.deletedData.forEach((dataItem) => {
      if (!optionsHash[dataItem.text]) {
        this.redundancies.push(dataItem);
      }
    });

    if (this.redundancies.length > 0) {
      this.status = CoreTypes.Status.error;
    }
  }

  getIsReceiving() {
    return (
      !this.receiving.l.open &&
      !this.receiving.t.open &&
      !this.receiving.r.open &&
      !this.receiving.b.open
    );
  }

  removeCurve(d: Direction, targetId: string) {
    const targetI = this.curves[d].findIndex(
      (curve) => curve.shape.id === targetId
    );
    this.curves[d].splice(targetI, 1);
  }

  move(p: Vec, dragP: Vec) {
    let xOffset = (p.x - dragP.x) / this.scale,
      yOffset = (p.y - dragP.y) / this.scale;

    this.p = {
      x: this.p.x + xOffset,
      y: this.p.y + yOffset,
    };
  }

  moveCurve(
    d: CommonTypes.Direction,
    id: string,
    moveTargets: CurveTypes.PressingTarget[],
    p: Vec
  ) {
    const curve = this.curves[d].find((curve) => curve.shape.id === id)?.shape;

    if (!curve) return;

    moveTargets.forEach((moveTarget) => {
      switch (moveTarget) {
        case CurveTypes.PressingTarget.cp1:
          curve.cp1 = {
            x: curve.cp1.x + p.x / this.__scale__,
            y: curve.cp1.y + p.y / this.__scale__,
          };
          break;

        case CurveTypes.PressingTarget.cp2:
          curve.cp2 = {
            x: curve.cp2.x + p.x / this.__scale__,
            y: curve.cp2.y + p.y / this.__scale__,
          };
          break;

        case CurveTypes.PressingTarget.p2:
          curve.p2 = {
            x: curve.p2.x + p.x / this.__scale__,
            y: curve.p2.y + p.y / this.__scale__,
          };
          break;
      }
    });
  }

  locateCurve(
    d: Direction,
    id: string,
    coordinate: {
      [moveTarget in
        | CurveTypes.PressingTarget.cp1
        | CurveTypes.PressingTarget.cp2
        | CurveTypes.PressingTarget.p2]?: Vec;
    }
  ) {
    const curve = this.curves[d].find((curve) => curve.shape.id === id)?.shape;

    if (!curve) return;

    const getRedressedCoordinate = (coordinate: Vec) => ({
      x: coordinate.x / this.scale - this.offset.x,
      y: coordinate.y / this.scale - this.offset.y,
    });

    if (coordinate[CurveTypes.PressingTarget.cp1]) {
      const redressedCoordinate = getRedressedCoordinate(
        coordinate[CurveTypes.PressingTarget.cp1]
      );
      curve.cp1 = {
        x: redressedCoordinate.x - this.p.x,
        y: redressedCoordinate.y - this.p.y,
      };
    }

    if (coordinate[CurveTypes.PressingTarget.cp2]) {
      const redressedCoordinate = getRedressedCoordinate(
        coordinate[CurveTypes.PressingTarget.cp2]
      );
      curve.cp2 = {
        x: redressedCoordinate.x - this.p.x,
        y: redressedCoordinate.y - this.p.y,
      };
    }

    if (coordinate[CurveTypes.PressingTarget.p2]) {
      const redressedCoordinate = getRedressedCoordinate(
        coordinate[CurveTypes.PressingTarget.p2]
      );
      curve.p2 = {
        x: redressedCoordinate.x - this.p.x,
        y: redressedCoordinate.y - this.p.y,
      };
    }
  }

  resize(offset: Vec, vertex: CoreTypes.PressingTarget) {
    if (
      vertex !== CoreTypes.PressingTarget.lt &&
      vertex !== CoreTypes.PressingTarget.rt &&
      vertex !== CoreTypes.PressingTarget.rb &&
      vertex !== CoreTypes.PressingTarget.lb
    )
      return;
    // sender curves follows
    let _w = this.w,
      _h = this.h;

    if (vertex === CoreTypes.PressingTarget.lt) {
      _w =
        this.w - offset.x / this.scale <= 0
          ? 0
          : this.w - offset.x / this.scale;
      _h =
        this.h - offset.y / this.scale <= 0
          ? 0
          : this.h - offset.y / this.scale;

      if (_w > 0 || offset.x < 0) {
        this.w = Math.abs(_w);
      }
      if (this.h > 0 || offset.y < 0) {
        this.h = Math.abs(_h);
      }
    } else if (vertex === CoreTypes.PressingTarget.rt) {
      _w =
        this.w + offset.x / this.scale <= 0
          ? 0
          : this.w + offset.x / this.scale;
      _h =
        this.h - offset.y / this.scale <= 0
          ? 0
          : this.h - offset.y / this.scale;

      if (_w > 0 || offset.x > 0) {
        this.w = Math.abs(_w);
      }
      if (this.h > 0 || offset.y < 0) {
        this.h = Math.abs(_h);
      }
    } else if (vertex === CoreTypes.PressingTarget.rb) {
      _w =
        this.w + offset.x / this.scale <= 0
          ? 0
          : this.w + offset.x / this.scale;
      _h =
        this.h + offset.y / this.scale <= 0
          ? 0
          : this.h + offset.y / this.scale;

      if (_w > 0 || offset.x > 0) {
        this.w = Math.abs(_w);
      }
      if (this.h > 0 || offset.y > 0) {
        this.h = Math.abs(_h);
      }
    } else if (vertex === CoreTypes.PressingTarget.lb) {
      _w =
        this.w - offset.x / this.scale <= 0
          ? 0
          : this.w - offset.x / this.scale;
      _h =
        this.h + offset.y / this.scale <= 0
          ? 0
          : this.h + offset.y / this.scale;

      if (_w > 0 || offset.x < 0) {
        this.w = Math.abs(_w);
      }
      if (this.h > 0 || offset.y > 0) {
        this.h = Math.abs(_h);
      }
    }

    this.p = {
      x: _w > 0 ? this.p.x + offset.x / 2 / this.scale : this.p.x,
      y: _h > 0 ? this.p.y + offset.y / 2 / this.scale : this.p.y,
    };
  }

  initializeCurve(id: string, _d: Direction) {
    let newCurve = null;

    if (_d === Direction.l) {
      newCurve = new Curve(
        id,
        {
          x: -this.w / 2,
          y: 0,
        },
        {
          x: -this.w / 2 + (-this.curveTrigger.d * 1) / 3,
          y: 0,
        },
        {
          x: -this.w / 2 + (-this.curveTrigger.d * 2) / 3,
          y: 0,
        },
        {
          x: -this.w / 2 - this.curveTrigger.d,
          y: 0,
        }
      );
    } else if (_d === Direction.t) {
      newCurve = new Curve(
        id,
        {
          x: 0,
          y: -this.h / 2,
        },
        {
          x: 0,
          y: -this.h / 2 + (-this.curveTrigger.d * 1) / 3,
        },
        {
          x: 0,
          y: -this.h / 2 + (-this.curveTrigger.d * 2) / 3,
        },
        {
          x: 0,
          y: -this.h / 2 - this.curveTrigger.d,
        }
      );
    } else if (_d === Direction.r) {
      newCurve = new Curve(
        id,
        {
          x: this.w / 2,
          y: 0,
        },
        {
          x: this.w / 2 + (this.curveTrigger.d * 1) / 3,
          y: 0,
        },
        {
          x: this.w / 2 + (this.curveTrigger.d * 2) / 3,
          y: 0,
        },
        {
          x: this.w / 2 + this.curveTrigger.d,
          y: 0,
        }
      );
    } else if (_d === Direction.b) {
      newCurve = new Curve(
        id,
        {
          x: 0,
          y: this.h / 2,
        },
        {
          x: 0,
          y: this.h / 2 + (this.curveTrigger.d * 1) / 3,
        },
        {
          x: 0,
          y: this.h / 2 + (this.curveTrigger.d * 2) / 3,
        },
        {
          x: 0,
          y: this.h / 2 + this.curveTrigger.d,
        }
      );
    }

    if (!newCurve) return;
    newCurve.scale = this.scale;

    this.curves[_d].push({
      shape: newCurve,
      sendTo: null,
    });
  }

  createCurve(
    id: string,
    d: Direction,
    p1: Vec,
    p2: Vec,
    cp1: Vec,
    cp2: Vec,
    sendTo: null | CoreTypes.SendTo
  ) {
    this.curves[d].push({
      shape: new Curve(id, p1, cp1, cp2, p2),
      sendTo: sendTo,
    });
  }

  renderText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(""),
      lines: string[] = [];
    let line = "";

    for (const word of words) {
      const testLine = line + word,
        metrics = ctx.measureText(testLine),
        testWidth = metrics.width;

      if (testWidth > maxWidth - 32 * this.scale) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }

    lines.push(line);

    const offsetYs: number[] = [];
    let offsetY =
      lines.length % 2 === 0
        ? lineHeight * (1 / 2 + lines.length / 2 - 1)
        : lineHeight * Math.floor(lines.length / 2);

    lines.forEach(() => {
      offsetYs.push(offsetY);
      offsetY -= lineHeight;
    });

    lines.forEach((line, lineI) => {
      ctx.fillText(line, x, y - offsetYs[lineI]);
    });
  };

  draw(ctx: CanvasRenderingContext2D, drawShapePath: () => void) {
    const edge = this.getEdge(),
      fillRectParams = {
        x: edge.screen.l - this.getScreenP().x,
        y: edge.screen.t - this.getScreenP().y,
        w: this.getScreenSize().w,
        h: this.getScreenSize().h,
      };

    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);

    ctx.fillStyle = (() => {
      switch (this.status) {
        case CoreTypes.Status.disabled:
          return "#7e7e7e";

        case CoreTypes.Status.error:
          return "#EB5757";

        default:
          return this.c;
      }
    })();

    drawShapePath();

    if (this.status === CoreTypes.Status.error) {
      // draw error message
      ctx.textAlign = "end";
      ctx.fillText(
        "error!",
        this.getScreenSize().w / 2,
        -this.getScreenSize().h / 2 - 10
      );
    }

    if (this.getIsReceiving()) {
      if (this.__selecting__) {
        // draw frame
        ctx.fillStyle = "white";
        ctx.strokeStyle = "#00BFFF";
        ctx.lineWidth = this.strokeSize;
        ctx.beginPath();
        ctx.strokeRect(
          fillRectParams.x,
          fillRectParams.y,
          fillRectParams.w,
          fillRectParams.h
        );
        ctx.closePath();

        // draw anchors
        ctx.lineWidth = this.anchor.size.stroke;
        ctx.beginPath();
        ctx.arc(
          edge.screen.l - this.getScreenP().x,
          edge.screen.t - this.getScreenP().y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // left, top
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(
          edge.screen.r - this.getScreenP().x,
          edge.screen.t - this.getScreenP().y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // right, top
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(
          edge.screen.l - this.getScreenP().x,
          edge.screen.b - this.getScreenP().y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // left, bottom
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(
          edge.screen.r - this.getScreenP().x,
          edge.screen.b - this.getScreenP().y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // right, bottom
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      }
    }

    // render center text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = `16px ${inter.style.fontFamily}`;

    this.renderText(ctx, this.title, 0, 0, this.getScreenSize().w, 16);

    // draw id text
    // ctx.textAlign = "start";
    // ctx.fillText(
    //   this.id,
    //   -this.getScreenSize().w / 2,
    //   -this.getScreenSize().h / 2 - 10
    // );

    ctx.restore();
  }

  drawCurve(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);

    ds.forEach((d) => {
      this.curves[d].forEach((curve) => {
        curve.shape.draw(ctx);
      });
    });

    ctx.restore();
  }

  drawSendingPoint(ctx: CanvasRenderingContext2D) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    // draw curve triggers
    ctx.fillStyle = "white";
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.strokeSize;

    // left
    ctx.beginPath();
    ctx.arc(
      -this.getScreenSize().w / 2 - this.getScaleCurveTriggerDistance(),
      0,
      this.anchor.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // top
    ctx.beginPath();
    ctx.arc(
      0,
      -this.getScreenSize().h / 2 - this.getScaleCurveTriggerDistance(),
      this.anchor.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // right
    ctx.beginPath();
    ctx.arc(
      this.getScreenSize().w / 2 + this.getScaleCurveTriggerDistance(),
      0,
      this.anchor.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // bottom
    ctx.beginPath();
    ctx.arc(
      0,
      this.getScreenSize().h / 2 + this.getScaleCurveTriggerDistance(),
      this.curveTrigger.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }

  drawRecievingPoint(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    // draw receiving points
    ctx.fillStyle = "white";
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.anchor.size.stroke;

    // left
    if (this.receiving.l.open) {
      ctx.beginPath();
      if (this.receiving.l.highlight) {
        ctx.fillStyle = "DeepSkyBlue";
      }
      ctx.arc(
        -this.getScreenSize().w / 2,
        0,
        this.receiving.l.highlight
          ? this.anchor.size.fill + this.receiveHighlightOffset
          : this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    ctx.fillStyle = "white";

    // top
    if (this.receiving.t.open) {
      if (this.receiving.t.highlight) {
        ctx.fillStyle = "DeepSkyBlue";
      }
      ctx.beginPath();
      ctx.arc(
        0,
        -this.getScreenSize().h / 2,
        this.receiving.t.highlight
          ? this.anchor.size.fill + this.receiveHighlightOffset
          : this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    ctx.fillStyle = "white";

    // right
    if (this.receiving.r.open) {
      if (this.receiving.r.highlight) {
        ctx.fillStyle = "DeepSkyBlue";
      }
      ctx.beginPath();
      ctx.arc(
        this.getScreenSize().w / 2,
        0,
        this.receiving.r.highlight
          ? this.anchor.size.fill + this.receiveHighlightOffset
          : this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    ctx.fillStyle = "white";

    // bottom
    if (this.receiving.b.open) {
      if (this.receiving.b.highlight) {
        ctx.fillStyle = "DeepSkyBlue";
      }
      ctx.beginPath();
      ctx.arc(
        0,
        this.getScreenSize().h / 2,
        this.receiving.b.highlight
          ? this.anchor.size.fill + this.receiveHighlightOffset
          : this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    ctx.restore();
  }
}
