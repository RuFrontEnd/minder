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
  }; // TODO: should be protected
  private __selecting__: boolean;
  protected __receivePoint__: CoreTypes.ReceivePoint;
  receiveFrom: {
    l: CoreTypes.ReceiveFrom[];
    t: CoreTypes.ReceiveFrom[];
    r: CoreTypes.ReceiveFrom[];
    b: CoreTypes.ReceiveFrom[];
  };
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
    this.__receivePoint__ = {
      l: { visible: false, activate: false },
      t: { visible: false, activate: false },
      r: { visible: false, activate: false },
      b: { visible: false, activate: false },
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

  get scale() {
    return this.__scale__;
  }

  set scale(value: number) {
    this.__scale__ = value;

    ds.forEach((d) => {
      this.curves[d].forEach((curve) => {
        curve.shape.scale = value;
      });
    });
  }

  set selecting(_selecting: boolean) {
    this.__selecting__ = _selecting;
  }

  get selecting() {
    return this.__selecting__;
  }

  getCurveIds() {
    let curveIds: string[] = [];

    ds.forEach((d) => {
      this.curves[d].forEach((curve) => {
        curveIds.push(curve.shape.id);
      });
    });

    return curveIds;
  }

  getScreenP() {
    return {
      x: (this.p.x + this.offset.x) * this.scale,
      y: (this.p.y + this.offset.y) * this.scale,
    };
  }

  getScaleSize() {
    return {
      w: this.w * this.scale,
      h: this.h * this.scale,
    };
  }

  getScaleCurveTriggerDistance() {
    return this.curveTrigger.d * this.scale;
  }

  getCurveP = (target: CurveTypes.PressingTarget, curveId: CurveTypes.Id) => {
    const targetCurve = (() => {
      for (const d of ds) {
        const curve = this.curves[d].find(
          (curve) => curve.shape.id === curveId
        );
        if (curve) return curve;
      }
    })();

    if (!targetCurve) return;
    return targetCurve.shape[target];
  };

  getEdge() {
    return {
      l: this.getScreenP().x - this.getScaleSize().w / 2,
      t: this.getScreenP().y - this.getScaleSize().h / 2,
      r: this.getScreenP().x + this.getScaleSize().w / 2,
      b: this.getScreenP().y + this.getScaleSize().h / 2,
    };
  }

  getCenter() {
    const edge = this.getEdge();
    const pivot = {
      x: this.getScreenP().x,
      y: this.getScreenP().y,
    };

    return {
      m: pivot,
      lt: {
        x: edge.l,
        y: edge.t,
      },
      rt: {
        x: edge.r,
        y: edge.t,
      },
      rb: {
        x: edge.r,
        y: edge.b,
      },
      lb: {
        x: edge.l,
        y: edge.b,
      },
      curveTrigger: {
        l: {
          x: edge.l - this.getScaleCurveTriggerDistance(),
          y: pivot.y,
        },
        t: {
          x: pivot.x,
          y: edge.t - this.getScaleCurveTriggerDistance(),
        },
        r: {
          x: edge.r + this.getScaleCurveTriggerDistance(),
          y: pivot.y,
        },
        b: {
          x: pivot.x,
          y: edge.b + this.getScaleCurveTriggerDistance(),
        },
      },
      receivingPoints: {
        l: {
          x: pivot.x - this.getScaleSize().w / 2,
          y: pivot.y,
        },
        t: {
          x: pivot.x,
          y: pivot.y - this.getScaleSize().h / 2,
        },
        r: {
          x: pivot.x + this.getScaleSize().w / 2,
          y: pivot.y,
        },
        b: {
          x: pivot.x,
          y: pivot.y + this.getScaleSize().h / 2,
        },
      },
    };
  }

  checkBoundry(p: Vec, threshold: number = 0) {
    const edge = this.getEdge();

    return (
      p.x > edge.l - this.anchor.size.fill - threshold &&
      p.y > edge.t - this.anchor.size.fill - threshold &&
      p.x < edge.r + this.anchor.size.fill + threshold &&
      p.y < edge.b + this.anchor.size.fill + threshold
    );
  }

  checkQuarterArea(p: Vec) {
    const center = this.getCenter();
    const screenP = {
      x: p.x * this.scale - this.offset.x,
      y: p.y * this.scale - this.offset.y,
    };

    // 定义四个方向的三角形边向量
    const quarterVecs = {
      l: {
        lt_m: { x: center.m.x - center.lt.x, y: center.m.y - center.lt.y },
        m_lb: { x: center.lb.x - center.m.x, y: center.lb.y - center.m.y },
        lb_lt: { x: center.lt.x - center.lb.x, y: center.lt.y - center.lb.y },
      },
      t: {
        lt_rt: { x: center.rt.x - center.lt.x, y: center.rt.y - center.lt.y },
        rt_m: { x: center.m.x - center.rt.x, y: center.m.y - center.rt.y },
        m_lt: { x: center.lt.x - center.m.x, y: center.lt.y - center.m.y },
      },
      r: {
        rt_rb: { x: center.rb.x - center.rt.x, y: center.rb.y - center.rt.y },
        rb_m: { x: center.m.x - center.rb.x, y: center.m.y - center.rb.y },
        m_rt: { x: center.rt.x - center.m.x, y: center.rt.y - center.m.y },
      },
      b: {
        rb_lb: { x: center.lb.x - center.rb.x, y: center.lb.y - center.rb.y },
        m_rb: { x: center.rb.x - center.m.x, y: center.rb.y - center.m.y },
        lb_m: { x: center.m.x - center.lb.x, y: center.m.y - center.lb.y },
      },
    };

    // 定义目标点相对于三角形顶点的向量
    const targetVecs = {
      l: {
        lt_p: { x: screenP.x - center.lt.x, y: screenP.y - center.lt.y },
        m_p: { x: screenP.x - center.m.x, y: screenP.y - center.m.y },
        lb_p: { x: screenP.x - center.lb.x, y: screenP.y - center.lb.y },
      },
      t: {
        lt_p: { x: screenP.x - center.lt.x, y: screenP.y - center.lt.y },
        rt_p: { x: screenP.x - center.rt.x, y: screenP.y - center.rt.y },
        m_p: { x: screenP.x - center.m.x, y: screenP.y - center.m.y },
      },
      r: {
        rt_p: { x: screenP.x - center.rt.x, y: screenP.y - center.rt.y },
        rb_p: { x: screenP.x - center.rb.x, y: screenP.y - center.rb.y },
        m_p: { x: screenP.x - center.m.x, y: screenP.y - center.m.y },
      },
      b: {
        lb_p: { x: screenP.x - center.lb.x, y: screenP.y - center.lb.y },
        rb_p: { x: screenP.x - center.rb.x, y: screenP.y - center.rb.y },
        m_p: { x: screenP.x - center.m.x, y: screenP.y - center.m.y },
      },
    };

    const checkInsideTriangle = (
      vecs: [Vec, Vec, Vec],
      target: [Vec, Vec, Vec]
    ) => {
      const cross1 = vecs[0].x * target[0].y - vecs[0].y * target[0].x;
      const cross2 = vecs[1].x * target[1].y - vecs[1].y * target[1].x;
      const cross3 = vecs[2].x * target[2].y - vecs[2].y * target[2].x;

      return (
        (cross1 > 0 && cross2 > 0 && cross3 > 0) ||
        (cross1 < 0 && cross2 < 0 && cross3 < 0)
      );
    };

    if (
      checkInsideTriangle(
        [quarterVecs.l.lt_m, quarterVecs.l.m_lb, quarterVecs.l.lb_lt],
        [targetVecs.l.lt_p, targetVecs.l.m_p, targetVecs.l.lb_p]
      )
    ) {
      return Direction.l;
    } else if (
      checkInsideTriangle(
        [quarterVecs.t.lt_rt, quarterVecs.t.rt_m, quarterVecs.t.m_lt],
        [targetVecs.t.lt_p, targetVecs.t.rt_p, targetVecs.t.m_p]
      )
    ) {
      return Direction.t;
    } else if (
      checkInsideTriangle(
        [quarterVecs.r.rt_rb, quarterVecs.r.rb_m, quarterVecs.r.m_rt],
        [targetVecs.r.rt_p, targetVecs.r.rb_p, targetVecs.r.m_p]
      )
    ) {
      return Direction.r;
    } else if (
      checkInsideTriangle(
        [quarterVecs.b.rb_lb, quarterVecs.b.m_rb, quarterVecs.b.lb_m],
        [targetVecs.b.lb_p, targetVecs.b.rb_p, targetVecs.b.m_p]
      )
    ) {
      return Direction.b;
    }

    return null;
  }

  checkCurvesBoundry(p: Vec) {
    const withinRangeCurveIds: CurveTypes.Id[] = [];
    const curveP = {
      x: p.x - this?.getScreenP().x,
      y: p.y - this?.getScreenP().y,
    };

    ds.forEach((d) => {
      this.curves[d].forEach((curve) => {
        if (!curve.shape.checkBoundry(curveP)) return;
        withinRangeCurveIds.push(curve.shape.id);
      });
    });

    return withinRangeCurveIds;
  }

  checkCurveControlPointsBoundry(p: Vec) {
    const withinRangeCurveIds: {
      id: CurveTypes.Id;
      target: CurveTypes.PressingTarget;
      isSelecting: boolean;
      d: Direction;
    }[] = [];
    const curveP = {
      x: p.x - this?.getScreenP().x,
      y: p.y - this?.getScreenP().y,
    };

    ds.forEach((d) => {
      this.curves[d].forEach((curve) => {
        const pressingHandler = curve.shape.checkControlPointsBoundry(curveP);
        if (!pressingHandler) return;
        withinRangeCurveIds.push({
          id: curve.shape.id,
          target: pressingHandler,
          isSelecting: curve.shape.selecting,
          d: d,
        });
      });
    });

    return withinRangeCurveIds;
  }

  checkVertexesBoundry(p: Vec) {
    const edge = this.getEdge();

    let dx, dy;

    dx = edge.l - p.x;
    dy = edge.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.lt;
    }

    dx = edge.r - p.x;
    dy = edge.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.rt;
    }

    dx = edge.r - p.x;
    dy = edge.b - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.rb;
    }

    dx = edge.l - p.x;
    dy = edge.b - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.lb;
    }

    return null;
  }

  checkReceivingBoundry(p: Vec) {
    const edge = this.getEdge();

    const receivingBoundryOffset = 10;

    return (
      p.x > edge.l - receivingBoundryOffset &&
      p.y > edge.t - receivingBoundryOffset &&
      p.x < edge.r + receivingBoundryOffset &&
      p.y < edge.b + receivingBoundryOffset
    );
  }

  checkReceivingPointsBoundry(p: Vec) {
    const edge = this.getEdge(),
      center = this.getCenter();

    let dx, dy;

    dx = edge.l - p.x;
    dy = center.m.y - p.y;

    if (
      this.__receivePoint__.l.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.l;
    }

    dx = center.m.x - p.x;
    dy = edge.t - p.y;

    if (
      this.__receivePoint__.t.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.t;
    }

    dx = p.x - edge.r;
    dy = center.m.y - p.y;

    if (
      this.__receivePoint__.r.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.r;
    }

    dx = center.m.x - p.x;
    dy = p.y - edge.b;

    if (
      this.__receivePoint__.b.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.b;
    }

    return null;
  }

  getCurveTriggerDirection(p: Vec) {
    if (!this.selecting) return null;
    const center = this.getCenter();

    for (const d of ds) {
      if (
        (p.x - center.curveTrigger[d].x) * (p.x - center.curveTrigger[d].x) +
          (p.y - center.curveTrigger[d].y) * (p.y - center.curveTrigger[d].y) <
        this.curveTrigger.size.fill * this.curveTrigger.size.fill
      ) {
        return Direction[d];
      }
    }
  }

  setIsCurveSelected(curveId: CurveTypes.Id, _selecting: boolean) {
    ds.forEach((d) => {
      const targetCurve = this.curves[d].find(
        (curve) => curve.shape.id === curveId
      )?.shape;

      if (!targetCurve) return;
      targetCurve.selecting = _selecting;
    });
  }

  // setAllCurvesSelected(_selecting: boolean) {
  //   ds.forEach((d) => {
  //     this.curves[d].forEach((curve)=>{
  //       curve.shape.selecting = _selecting;
  //     })

  //   });
  // }

  setReceivePointVisible(d: Direction, _visible: boolean) {
    this.__receivePoint__[d].visible = _visible;
  }

  setReceivePointActivate(d: Direction, _actviate: boolean) {
    this.__receivePoint__[d].activate = _actviate;
  }

  connect(targetShape: Core, targetShapeReceiveD: Direction, bridgeId: string) {
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
  }

  disConnect(curveIds: string[]) {
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
      !this.__receivePoint__.l.visible &&
      !this.__receivePoint__.t.visible &&
      !this.__receivePoint__.r.visible &&
      !this.__receivePoint__.b.visible
    );
  }

  removeCurve(d: Direction, targetId: string) {
    const targetI = this.curves[d].findIndex(
      (curve) => curve.shape.id === targetId
    );
    this.curves[d].splice(targetI, 1);
  }

  move(offset: Vec) {
    let xOffset = offset.x / this.scale,
      yOffset = offset.y / this.scale;

    this.p = {
      x: this.p.x + xOffset,
      y: this.p.y + yOffset,
    };
  }

  moveCurve(curveId: CurveTypes.Id, p: Vec) {
    const targetCurve = (() => {
      for (const d of ds) {
        const curve = this.curves[d].find(
          (curve) => curve.shape.id === curveId
        );
        if (curve) return curve;
      }
    })();

    if (!targetCurve) return;
    targetCurve.shape.move(p);
  }

  moveCurveHandler(
    d: Direction,
    curveId: CurveTypes.Id,
    pressingTarget: CurveTypes.PressingTarget,
    offset: Vec
  ) {
    const targetCurve = this.curves[d].find(
      (curve) => curve.shape.id === curveId
    )?.shape;

    if (!targetCurve) return;
    targetCurve.moveHandler(pressingTarget, offset);
  }

  locateCurveHandler(
    curveId: CurveTypes.Id,
    target: CurveTypes.PressingTarget,
    p: Vec
  ) {
    const targetCurve = (() => {
      for (const d of ds) {
        const curve = this.curves[d].find(
          (curve) => curve.shape.id === curveId
        );
        if (curve) return curve;
      }
    })();

    if (!targetCurve) return;

    targetCurve.shape.locateHandler(target, p);
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
    lineHeight: number,
    scale: number
  ) => {
    const words = text.split("");
    const lines: string[] = [];
    const padding = 32;
    let line = "";

    for (const word of words) {
      const testLine = line + word,
        metrics = ctx.measureText(testLine),
        testWidth = metrics.width;

      if (testWidth > maxWidth - padding * scale) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }

    lines.push(line);

    // 计算最大行数
    const maxLines = Math.floor(((this.h - padding) * this.scale) / lineHeight);

    // 确保绘制的行数不超过最大行数
    const totalLines = Math.min(lines.length, maxLines);

    // 计算最后一行的宽度，并检查是否需要加上省略号
    if (totalLines < lines.length) {
      const lastLine = lines[totalLines - 1] || "";
      const ellipsis = "...";
      const metricsEllipsis = ctx.measureText(ellipsis);
      const maxTextWidth = maxWidth - 32 * scale - metricsEllipsis.width;

      let truncatedLine = "";
      for (const char of lastLine) {
        const testLine = truncatedLine + char;
        const metricsTestLine = ctx.measureText(testLine);
        if (metricsTestLine.width > maxTextWidth) {
          break;
        }
        truncatedLine = testLine;
      }
      lines[totalLines - 1] = truncatedLine + ellipsis;
    }

    const offsetYs: number[] = [];
    let offsetY =
      totalLines % 2 === 0
        ? lineHeight * (1 / 2 + totalLines / 2 - 1)
        : lineHeight * Math.floor(totalLines / 2);

    for (let i = 0; i < totalLines; i++) {
      offsetYs.push(offsetY);
      offsetY -= lineHeight;
    }

    for (let i = 0; i < totalLines; i++) {
      ctx.fillText(lines[i], x, y - offsetYs[i]);
    }
  };

  draw(ctx: CanvasRenderingContext2D, drawShapePath: () => void) {
    const edge = this.getEdge(),
      fillRectParams = {
        x: edge.l - this.getScreenP().x,
        y: edge.t - this.getScreenP().y,
        w: this.getScaleSize().w,
        h: this.getScaleSize().h,
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
        this.getScaleSize().w / 2,
        -this.getScaleSize().h / 2 - 10
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
          edge.l - this.getScreenP().x,
          edge.t - this.getScreenP().y,
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
          edge.r - this.getScreenP().x,
          edge.t - this.getScreenP().y,
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
          edge.l - this.getScreenP().x,
          edge.b - this.getScreenP().y,
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
          edge.r - this.getScreenP().x,
          edge.b - this.getScreenP().y,
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

    this.renderText(
      ctx,
      this.title,
      0,
      0,
      this.getScaleSize().w,
      20,
      this.scale
    );

    // draw id text
    // ctx.textAlign = "start";
    // ctx.fillText(
    //   this.id,
    //   -this.getScaleSize().w / 2,
    //   -this.getScaleSize().h / 2 - 10
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
      -this.getScaleSize().w / 2 - this.getScaleCurveTriggerDistance(),
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
      -this.getScaleSize().h / 2 - this.getScaleCurveTriggerDistance(),
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
      this.getScaleSize().w / 2 + this.getScaleCurveTriggerDistance(),
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
      this.getScaleSize().h / 2 + this.getScaleCurveTriggerDistance(),
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
    ctx.fillStyle = tailwindColors.white["500"];
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.anchor.size.stroke;

    // left
    if (this.__receivePoint__.l.visible) {
      if (this.__receivePoint__.l.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        -this.getScaleSize().w / 2,
        0,
        this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    // top
    if (this.__receivePoint__.t.visible) {
      if (this.__receivePoint__.t.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        0,
        -this.getScaleSize().h / 2,
        this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    // right
    if (this.__receivePoint__.r.visible) {
      if (this.__receivePoint__.r.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        this.getScaleSize().w / 2,
        0,
        this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    // bottom
    if (this.__receivePoint__.b.visible) {
      if (this.__receivePoint__.b.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        0,
        this.getScaleSize().h / 2,
        this.anchor.size.fill,
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
