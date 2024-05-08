"use client";
import Curve from "@/shapes/curve";
import { tailwindColors } from "@/variables/colors";
import { Inter } from "next/font/google";
import { Vec, Direction, Data as DataType } from "@/types/shapes/common";
import { Line } from "@/types/shapes/curve";
import * as CoreTypes from "@/types/shapes/core";
import * as CommonTypes from "@/types/shapes/common";

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
  private curveTrigger: {
    d: number;
    size: {
      fill: number;
      stroke: number;
    };
    cpline: Line;
    curve: Line;
  } = {
    d: 50,
    size: {
      fill: 4,
      stroke: 2,
    },
    cpline: {
      w: 1,
      c: tailwindColors?.info["500"] || "#000000",
    },
    curve: {
      w: 1,
      c: "#333333",
    },
  };
  private strokeSize = 1;
  private initPressing = {
    activate: false,
    target: null,
  };
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
    d: CommonTypes.Direction;
    shape: Curve;
    sendTo: null | CoreTypes.SendTo;
  }[];
  __selecting__: boolean;
  __receiving__: CoreTypes.Receiving;
  pressing: {
    activate: boolean;
    target: CoreTypes.PressingTarget | null;
  };
  receiveFrom: {
    l: null | CoreTypes.ReceiveFrom;
    t: null | CoreTypes.ReceiveFrom;
    r: null | CoreTypes.ReceiveFrom;
    b: null | CoreTypes.ReceiveFrom;
  };
  dragP:
    | Vec
    | {
        x: null;
        y: null;
      };
  options: DataType;
  selectedData: DataType;
  redundancies: DataType;
  __offset__: Vec;
  __scale__: number;

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
    this.curves = [];
    this.__selecting__ = false;
    this.__receiving__ = {
      l: false,
      t: false,
      r: false,
      b: false,
    };
    this.pressing = this.initPressing;
    this.receiveFrom = {
      l: null,
      t: null,
      r: null,
      b: null,
    };
    this.dragP = {
      x: null,
      y: null,
    };
    this.options = [];
    this.selectedData = [];
    this.redundancies = [];
    this.__offset__ = this.initOffset;
    this.__scale__ = this.initScale;
  }

  set p(value: Vec) {
    const offest = {
      x: value.x - this.p.x,
      y: value.y - this.p.y,
    };
    this.__p__ = value;

    // TODO: curve 相關
    // when receiver shape move, sender curve follows the receiver shape
    ds.forEach((d) => {
      const receiverShape = this.receiveFrom[d],
        sendCurves = receiverShape?.shape.curves.filter(
          (curve) => curve.d === receiverShape.d
        );

      if (!sendCurves) return;

      sendCurves.forEach((sendCurve) => {
        sendCurve.shape.p2 = {
          x: sendCurve.shape.p2.x + offest.x,
          y: sendCurve.shape.p2.y + offest.y,
        };
        sendCurve.shape.cp2.x += offest.x;
        sendCurve.shape.cp2.y += offest.y;
      });
    });

    // when sender shape move, receiver curve follows the sender shape
    this.curves.forEach((curve) => {
      const senderCurve = curve.shape,
        sendToShape = curve.sendTo;

      if (senderCurve && sendToShape) {
        senderCurve.p2 = {
          x: senderCurve.p2.x - offest.x,
          y: senderCurve.p2.y - offest.y,
        };
        senderCurve.cp2.x -= offest.x;
        senderCurve.cp2.y -= offest.y;
      }
    });
  }

  get p() {
    return this.__p__;
  }

  set w(value: number) {
    const offset = (this.w - value) / 2;
    this.__w__ = value;

    // TODO: curve 相關

    const horizentalCurves = this.curves.filter(
      (curve) => curve.d === Direction.l || curve.d === Direction.r
    );

    horizentalCurves.forEach((horizentalCurve) => {
      const theCurve = horizentalCurve.shape;
      if (horizentalCurve.d === Direction.l) {
        theCurve.p1.x += offset;
        theCurve.cp1.x += offset;

        if (!horizentalCurve.sendTo) {
          theCurve.p2 = {
            ...theCurve.p2,
            x: theCurve.p2.x + offset,
          };
          theCurve.cp2.x += offset;
        }
      } else if (horizentalCurve.d === Direction.r) {
        theCurve.p1.x -= offset;
        theCurve.cp1.x -= offset;
      }

      if (!horizentalCurve.sendTo) {
        theCurve.p2 = {
          ...theCurve.p2,
          x: theCurve.p2.x - offset,
        };
        theCurve.cp2.x -= offset;
      }
    });

    // TODO: curve 相關
    const receiveFromCurves_l = this.receiveFrom.l?.shape.curves.filter(
        (curve) => curve.d === this.receiveFrom.l?.d
      ),
      receiveFromCurves_r = this.receiveFrom.r?.shape.curves.filter(
        (curve) => curve.d === this.receiveFrom.r?.d
      );

    if (receiveFromCurves_l) {
      receiveFromCurves_l.forEach((receiveFromCurve_l) => {
        receiveFromCurve_l.shape.p2 = {
          ...receiveFromCurve_l.shape.p2,
          x: receiveFromCurve_l.shape.p2.x + offset,
        };
        receiveFromCurve_l.shape.cp2.x += offset;
      });
    }

    if (receiveFromCurves_r) {
      receiveFromCurves_r.forEach((receiveFromCurve_r) => {
        receiveFromCurve_r.shape.p2 = {
          ...receiveFromCurve_r.shape.p2,
          x: receiveFromCurve_r.shape.p2.x + offset,
        };
        receiveFromCurve_r.shape.cp2.x += offset;
      });
    }
  }

  get w() {
    return this.__w__;
  }

  set h(value: number) {
    const offset = (this.h - value) / 2;
    this.__h__ = value;

    // TODO: curve 相關
    const horizentalCurves = this.curves.filter(
      (curve) => curve.d === Direction.t || curve.d === Direction.b
    );

    horizentalCurves.forEach((horizentalCurve) => {
      const theCurve = horizentalCurve.shape;
      if (horizentalCurve.d === Direction.t) {
        theCurve.p1.y += offset;
        theCurve.cp1.y += offset;

        if (!horizentalCurve.sendTo) {
          theCurve.p2 = {
            ...theCurve.p2,
            y: theCurve.p2.y + offset,
          };
          theCurve.cp2.y += offset;
        }
      } else if (horizentalCurve.d === Direction.b) {
        theCurve.p1.y -= offset;
        theCurve.cp1.y -= offset;
      }

      if (!horizentalCurve.sendTo) {
        theCurve.p2 = {
          ...theCurve.p2,
          y: theCurve.p2.y - offset,
        };
        theCurve.cp2.y -= offset;
      }
    });

    // TODO: curve 相關
    // const receiveFromCurve_t = this.receiveFrom.t?.shape.curves[
    //   this.receiveFrom.t.sendD
    // ].shape,
    //   receiveFromCurve_b = this.receiveFrom.b?.shape.curves[
    //     this.receiveFrom.b.sendD
    //   ].shape;

    // if (receiveFromCurve_t) {
    //   receiveFromCurve_t.p2 = {
    //     ...receiveFromCurve_t.p2,
    //     y: receiveFromCurve_t.p2.y + offset,
    //   };
    //   receiveFromCurve_t.cp2.y += offset;
    // }

    // if (receiveFromCurve_b) {
    //   receiveFromCurve_b.p2 = {
    //     ...receiveFromCurve_b.p2,
    //     y: receiveFromCurve_b.p2.y - offset,
    //   };
    //   receiveFromCurve_b.cp2.y -= offset;
    // }
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

    // TODO: curve 相關

    this.curves.forEach((curve) => {
      curve.shape.scale = value;
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

  getScaleSize() {
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

  checkBoundry(p: Vec) {
    const edge = this.getEdge();

    return (
      p.x > edge.l - this.anchor.size.fill &&
      p.y > edge.t - this.anchor.size.fill &&
      p.x < edge.r + this.anchor.size.fill &&
      p.y < edge.b + this.anchor.size.fill
    );
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

    const receivingBoundryOffset = 75;

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
      this.receiving.l &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.l;
    }

    dx = center.m.x - p.x;
    dy = edge.t - p.y;

    if (
      this.receiving.t &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.t;
    }

    dx = p.x - edge.r;
    dy = center.m.y - p.y;

    if (
      this.receiving.r &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.r;
    }

    dx = center.m.x - p.x;
    dy = p.y - edge.b;

    if (
      this.receiving.b &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.b;
    }

    return null;
  }

  getCurveTriggerDirection(p: Vec) {
    if (!this.selecting) return null;
    const center = this.getCenter();

    // TODO: curve 相關
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

  connect(targetShape: Core, targetShapeD: Direction, sendCurveId: string) {
    // TODO: curve 相關

    const bridgeCurve = this.curves.find(
      (curve) => curve.shape.id === sendCurveId
    );
    if (!bridgeCurve) return;
    bridgeCurve.sendTo = { shape: targetShape, d: targetShapeD };

    targetShape.receiveFrom[targetShapeD] = {
      shape: this,
      d: bridgeCurve.d,
    };

    const thershold = 10;

    if (targetShapeD === Direction.l) {
      bridgeCurve.shape.p2 = {
        x: targetShape.p.x - this.p.x - targetShape.w / 2 - thershold,
        y: targetShape.p.y - this.p.y,
      };
    } else if (targetShapeD === Direction.t) {
      bridgeCurve.shape.p2 = {
        x: targetShape.p.x - this.p.x,
        y: targetShape.p.y - this.p.y - targetShape.h / 2 - thershold,
      };
    } else if (targetShapeD === Direction.r) {
      bridgeCurve.shape.p2 = {
        x: targetShape.p.x - this.p.x + targetShape.w / 2 + thershold,
        y: targetShape.p.y - this.p.y,
      };
    } else if (targetShapeD === Direction.b) {
      bridgeCurve.shape.p2 = {
        x: targetShape.p.x - this.p.x,
        y: targetShape.p.y - this.p.y + targetShape.h / 2 + thershold,
      };
    }
  }

  disConnect(d: Direction, fromSender: boolean) {
    // TODO: curve 相關
    // if (fromSender) {
    //   const receiverShape = this.curves[d]?.sendTo?.shape,
    //     receiverDirection = this.curves[d]?.sendTo?.receiveD;
    //   if (receiverShape && receiverDirection) {
    //     receiverShape.receiveFrom[receiverDirection] = null;
    //     this.curves[d].sendTo = null;
    //   }
    // } else {
    //   const senderShape = this.receiveFrom[d]?.shape,
    //     senderDirection = this.receiveFrom[d]?.sendD;
    //   if (senderShape && senderDirection) {
    //     senderShape.curves[senderDirection].sendTo = null;
    //     this.receiveFrom[d] = null;
    //   }
    // }
  }

  getRedundancies() {
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
  }

  getIsReceiving() {
    return (
      !this.receiving.l &&
      !this.receiving.t &&
      !this.receiving.r &&
      !this.receiving.b
    );
  }

  removeCurve(targetId: string) {
    // TODO: curve 相關
    const targetI = this.curves.findIndex(
      (curve) => curve.shape.id === targetId
    );
    this.curves.splice(targetI, 1);
  }

  move(p: Vec, dragP: Vec) {
    let xOffset = (p.x - dragP.x) / this.scale,
      yOffset = (p.y - dragP.y) / this.scale;

    this.p = {
      x: this.p.x + xOffset,
      y: this.p.y + yOffset,
    };
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

  createCurve(id: string, _d: Direction) {
    // TODO: curve 相關

    let newCurve = null;

    if (_d === Direction.l) {
      newCurve = new Curve(
        id,
        this.curveTrigger.cpline,
        this.curveTrigger.curve,
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
        this.curveTrigger.cpline,
        this.curveTrigger.curve,
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
        this.curveTrigger.cpline,
        this.curveTrigger.curve,
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
        this.curveTrigger.cpline,
        this.curveTrigger.curve,
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

    this.curves.push({
      d: _d,
      shape: newCurve,
      sendTo: null,
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

    lines.forEach((line) => {
      offsetYs.push(offsetY);
      offsetY -= lineHeight;
    });

    // console.log('lines', lines)

    lines.forEach((line, lineI) => {
      ctx.fillText(line, x, y - offsetYs[lineI]);
    });
  };

  draw(ctx: CanvasRenderingContext2D) {
    const edge = this.getEdge(),
      fillRectParams = {
        x: edge.l - this.getScreenP().x,
        y: edge.t - this.getScreenP().y,
        w: this.getScaleSize().w,
        h: this.getScaleSize().h,
      };

    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);

    const isAlert = this.redundancies.length > 0;
    let renderC = isAlert ? "#EB5757" : this.c;

    ctx.fillStyle = renderC;

    if (isAlert) {
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

    this.renderText(ctx, this.title, 0, 0, this.getScaleSize().w, 16);

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
    // TODO: curve 相關
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);

    this.curves.forEach((curve) => {
      curve.shape.draw(ctx);
    });

    // if (this.curves.l.shape) {
    //   this.curves.l.shape.draw(ctx);
    // }

    // if (this.curves.t.shape) {
    //   this.curves.t.shape.draw(ctx);
    // }

    // if (this.curves.r.shape) {
    //   this.curves.r.shape.draw(ctx);
    // }

    // if (this.curves.b.shape) {
    //   this.curves.b.shape.draw(ctx);
    // }

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

    // TODO: curve 相關

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
    ctx.fillStyle = "white";
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.anchor.size.stroke;

    // left
    if (this.receiving.l) {
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
    if (this.receiving.t) {
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
    if (this.receiving.r) {
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
    if (this.receiving.b) {
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
